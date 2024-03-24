import { Body, Controller, Post } from "@nestjs/common";
import { SourceProcessService } from "./source-process.service";
import * as cron from "node-cron";
import { AllowNonUser } from "../../../auth/decorators/allownonuser.decorator";
import { ApiTags } from "@nestjs/swagger";
import { PostProcessSourceLoopDto } from "../../getter.dto";
import { AUTO_GETTER_ACTIVE } from "../../getter.controller";

@ApiTags("Getter")
@Controller()
export class SourceProcessController {
    constructor(private readonly sourceProcessService: SourceProcessService) {
        cron.schedule("30 4 * * *", () => {
            const time = 60 * 60 * 1000; // 1 hour
            if (AUTO_GETTER_ACTIVE)
                this.sourceProcessService.processLoopWithTimeout(time);
        });
    }

    @AllowNonUser()
    @Post("getter/source/process-next")
    async processNextSource() {
        return this.sourceProcessService.processNextSource();
    }

    @AllowNonUser()
    @Post("getter/source/process-loop")
    async processLoop(@Body() { time }: PostProcessSourceLoopDto) {
        return this.sourceProcessService.processLoopWithTimeout(time);
    }
}
