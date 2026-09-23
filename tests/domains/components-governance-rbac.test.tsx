import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  canApproveRelease,
  canCheckRelease,
  canMakeRelease,
  canOperateKillSwitch,
  canReviewGate,
} from "@/features/governance/release-governance";
import {
  canApprovePermission,
} from "@/features/governance/core";
import {
  canEditAgentRegistry,
} from "@/features/agents/registry";

describe("Governance RBAC Policies & Button States", () => {
  describe("Separation of Duties Matrix", () => {
    it("enforces Maker role strictly for IT_ADMIN", () => {
      expect(canMakeRelease(["IT_ADMIN"])).toBe(true);
      expect(canMakeRelease(["EXECUTIVE"])).toBe(false);
      expect(canMakeRelease(["QA_ASSURANCE"])).toBe(false);
      expect(canMakeRelease(["BUSINESS_REVIEWER"])).toBe(false);
      expect(canMakeRelease(["TECHNICAL_REVIEWER"])).toBe(false);
    });

    it("enforces Checker role for QA_ASSURANCE or TECHNICAL_REVIEWER", () => {
      expect(canCheckRelease(["QA_ASSURANCE"])).toBe(true);
      expect(canCheckRelease(["TECHNICAL_REVIEWER"])).toBe(true);
      expect(canCheckRelease(["IT_ADMIN"])).toBe(false);
      expect(canCheckRelease(["EXECUTIVE"])).toBe(false);
    });

    it("enforces Dual Review Gates for independent reviewers", () => {
      expect(canReviewGate(["BUSINESS_REVIEWER"])).toBe("BUSINESS");
      expect(canReviewGate(["TECHNICAL_REVIEWER"])).toBe("TECHNICAL");
      expect(canReviewGate(["EXECUTIVE"])).toBe(null);
      expect(canReviewGate(["IT_ADMIN"])).toBe(null);
      expect(canReviewGate(["OPERATOR"])).toBe(null);
    });

    it("enforces Approver role strictly for EXECUTIVE", () => {
      expect(canApproveRelease(["EXECUTIVE"])).toBe(true);
      expect(canApproveRelease(["IT_ADMIN"])).toBe(false);
      expect(canApproveRelease(["QA_ASSURANCE"])).toBe(false);
      expect(canApproveRelease(["TECHNICAL_REVIEWER"])).toBe(false);
    });

    it("enforces Kill Switch and Clear Kill Switch for EXECUTIVE and IT_ADMIN", () => {
      expect(canOperateKillSwitch(["EXECUTIVE"])).toBe(true);
      expect(canOperateKillSwitch(["IT_ADMIN"])).toBe(true);
      expect(canOperateKillSwitch(["QA_ASSURANCE"])).toBe(false);
      expect(canOperateKillSwitch(["BUSINESS_REVIEWER"])).toBe(false);
    });

    it("enforces Permission Policy Approval for EXECUTIVE and QA_ASSURANCE", () => {
      expect(canApprovePermission(["EXECUTIVE"])).toBe(true);
      expect(canApprovePermission(["QA_ASSURANCE"])).toBe(true);
      expect(canApprovePermission(["IT_ADMIN"])).toBe(false);
      expect(canApprovePermission(["BUSINESS_REVIEWER"])).toBe(false);
      expect(canApprovePermission(["OPERATOR"])).toBe(false);
    });

    it("enforces Agent Registry CRUD strictly for IT_ADMIN", () => {
      expect(canEditAgentRegistry(["IT_ADMIN"])).toBe(true);
      expect(canEditAgentRegistry(["ADMIN"])).toBe(false);
      expect(canEditAgentRegistry(["BUSINESS_REVIEWER"])).toBe(false);
      expect(canEditAgentRegistry(["EXECUTIVE"])).toBe(false);
      expect(canEditAgentRegistry(["OPERATOR"])).toBe(false);
    });
  });

  describe("UI Button States Verification", () => {
    function SimulatedBusinessGateButtons({ roles, isInReview }: { roles: string[]; isInReview: boolean }) {
      const canReview = roles.includes("BUSINESS_REVIEWER");
      return (
        <div className="gov-gate-actions">
          <button
            className="gov-modal-btn-confirm success"
            disabled={!isInReview || !canReview}
            title={!canReview ? "Hanya role BUSINESS_REVIEWER yang berwenang menyetujui gate ini." : undefined}
            type="button"
          >
            Approve Business Gate
          </button>
          <button
            className="gov-modal-btn-cancel"
            disabled={!isInReview || !canReview}
            title={!canReview ? "Hanya role BUSINESS_REVIEWER yang berwenang menolak gate ini." : undefined}
            type="button"
          >
            Reject Business Gate
          </button>
        </div>
      );
    }

    function SimulatedPermissionRow({ roles, status }: { roles: string[]; status: string }) {
      const canApprove = canApprovePermission(roles);
      return (
        <tr>
          <td>
            {status === "ACTIVE" ? (
              <span className="active-badge">Active</span>
            ) : (
              <button
                className="gov-perm-action-btn"
                disabled={!canApprove}
                title={!canApprove ? "Hanya EXECUTIVE atau QA_ASSURANCE yang berwenang menyetujui permission policy." : undefined}
                type="button"
              >
                Approve
              </button>
            )}
          </td>
        </tr>
      );
    }

    function SimulatedAgentDetailActions({
      roles,
      lifecycleStatus,
    }: {
      roles: string[];
      lifecycleStatus: string;
    }) {
      const canEdit = canEditAgentRegistry(roles);
      return (
        <div className="gov-agent-actions">
          {canEdit && (lifecycleStatus === "DRAFT" || lifecycleStatus === "RETURNED") && (
            <button className="gov-agent-btn-outline danger" type="button">
              Hapus Draft
            </button>
          )}
          {canEdit && (lifecycleStatus === "ACTIVE" || lifecycleStatus === "SUSPENDED") && (
            <button className="gov-agent-btn-outline danger" type="button">
              Pensiunkan
            </button>
          )}
        </div>
      );
    }

    it("disables Business Review Gate buttons when actor is not BUSINESS_REVIEWER", () => {
      const html = renderToStaticMarkup(
        <SimulatedBusinessGateButtons isInReview={true} roles={["IT_ADMIN"]} />
      );
      expect(html).toContain("disabled=\"\"");
      expect(html).toContain("Hanya role BUSINESS_REVIEWER");
    });

    it("enables Business Review Gate buttons when actor is BUSINESS_REVIEWER in review state", () => {
      const html = renderToStaticMarkup(
        <SimulatedBusinessGateButtons isInReview={true} roles={["BUSINESS_REVIEWER"]} />
      );
      expect(html).not.toContain("disabled=\"\"");
      expect(html).not.toContain("Hanya role BUSINESS_REVIEWER");
    });

    it("disables Permission Approve button for unauthorized roles", () => {
      const html = renderToStaticMarkup(
        <SimulatedPermissionRow roles={["IT_ADMIN"]} status="PENDING" />
      );
      expect(html).toContain("disabled=\"\"");
      expect(html).toContain("Hanya EXECUTIVE atau QA_ASSURANCE");
    });

    it("enables Permission Approve button for EXECUTIVE or QA_ASSURANCE", () => {
      const directorHtml = renderToStaticMarkup(
        <SimulatedPermissionRow roles={["EXECUTIVE"]} status="PENDING" />
      );
      expect(directorHtml).not.toContain("disabled=\"\"");

      const qaHtml = renderToStaticMarkup(
        <SimulatedPermissionRow roles={["QA_ASSURANCE"]} status="PENDING" />
      );
      expect(qaHtml).not.toContain("disabled=\"\"");
    });

    it("shows Delete Draft button only for DRAFT/RETURNED when user can edit registry", () => {
      const leadDraftHtml = renderToStaticMarkup(
        <SimulatedAgentDetailActions lifecycleStatus="DRAFT" roles={["IT_ADMIN"]} />
      );
      expect(leadDraftHtml).toContain("Hapus Draft");

      const reviewerDraftHtml = renderToStaticMarkup(
        <SimulatedAgentDetailActions lifecycleStatus="DRAFT" roles={["BUSINESS_REVIEWER"]} />
      );
      expect(reviewerDraftHtml).not.toContain("Hapus Draft");

      const leadActiveHtml = renderToStaticMarkup(
        <SimulatedAgentDetailActions lifecycleStatus="ACTIVE" roles={["IT_ADMIN"]} />
      );
      expect(leadActiveHtml).not.toContain("Hapus Draft");
      expect(leadActiveHtml).toContain("Pensiunkan");
    });
  });
});
