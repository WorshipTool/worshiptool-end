import { Test } from "@nestjs/testing";
import { DomainApprovalService } from "./domain-approval.service";
import { DomainApprovalModule } from "./domain-approval.module";

describe("GetterSource", () => {

    let approvalService: DomainApprovalService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [DomainApprovalModule],
          }).compile();

          approvalService = await module.get(DomainApprovalService);
        
        return;
    });

    it("should be defined", () => {
        expect(approvalService).toBeDefined();
    });

    it("should choose source", async () => {
        const source = await approvalService.chooseDomainToApprove();
        expect(source).toBeDefined();
    })

});