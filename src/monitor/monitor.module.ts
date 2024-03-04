import { Module } from "@nestjs/common";
import { StatusMonitorConfiguration, StatusMonitorModule } from "nest-status-monitor";
import { AllowNonUser } from "../auth/decorators/allownonuser.decorator";

export const monitorStatusPath = '/status';

const statusMonitorConfig : StatusMonitorConfiguration = {
    pageTitle: 'Nest.js Monitoring Page',
    port: 3300,
    path: monitorStatusPath,
    ignoreStartsWith: '/health/alive',
    spans: [
    {
        interval: 1, // Every second
        retention: 60, // Keep 60 datapoints in memory
    },
    {
        interval: 5, // Every 5 seconds
        retention: 60,
    },
    {
        interval: 15, // Every 15 seconds
        retention: 60,
    }
    ],
    chartVisibility: {
        cpu: true,
        mem: true,
        load: false,
        responseTime: false,
        rps: true,
        statusCodes: true,
    },
    healthChecks: []
}
@AllowNonUser()
@Module({
    imports: [
        StatusMonitorModule.setUp(statusMonitorConfig)
    ],
    controllers: [],
    providers: [],
    exports: []
})
export class MonitorModule {}