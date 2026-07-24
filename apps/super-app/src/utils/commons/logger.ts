import { CoralogixRum } from "@coralogix/browser";

import { getCredentialsAction } from "@/app/actions/credentials";

import { isServer } from "./helpers";

const redactKeys = ["token"].map((item) => item.toLocaleLowerCase());
const REDACT_MESSAGE = "[REDACTED]";

export class Logger {
  private readonly namespace: string;
  private userId?: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  private static get isCoralogixRumInited(): boolean {
    return !isServer && CoralogixRum.isInited;
  }

  private async initializeCredentials(): Promise<void> {
    if (this.userId) {
      return;
    }
    const credentials = await getCredentialsAction();
    if (credentials?.userId) {
      this.userId = credentials.userId;
    }
  }

  private redactData(data: unknown): unknown {
    if (typeof data !== "object" || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.redactData(item));
    }

    const sourceData = data as Record<string, unknown>;
    const redactedData: Record<string, unknown> = {};

    for (const key of Object.keys(sourceData)) {
      const camelCaseKey = key.toLocaleLowerCase();
      const isExistRedactKey = redactKeys.some((redactKey) =>
        camelCaseKey.includes(redactKey)
      );
      const currentValue = sourceData[key];
      redactedData[key] =
        isExistRedactKey && typeof currentValue === "string"
          ? REDACT_MESSAGE
          : this.redactData(currentValue);
    }

    return redactedData;
  }

  private formatData(data: Record<string, unknown>): string {
    const infoLog = {
      ...data,
      namespace: this.namespace,
      userId: this.userId,
    };

    const redactedLog = this.redactData(infoLog);

    return JSON.stringify(redactedLog);
  }

  async sendError(error: unknown, customData?: Record<string, unknown>) {
    await this.initializeCredentials();

    if (isServer) {
      const formattedData = this.formatData({
        error,
        ...customData,
      });

      console.error(formattedData);
      return;
    }

    if (Logger.isCoralogixRumInited) {
      const errorInstance =
        error instanceof Error ? error : new Error(String(error));
      CoralogixRum.captureError(
        errorInstance,
        { ...customData, userId: this.userId },
        { namespace: this.namespace }
      );
    }
  }

  async sendLog(...args: unknown[]) {
    await this.initializeCredentials();

    if (isServer) {
      const formattedData = this.formatData({
        ...args,
      });

      console.log(formattedData);
      return;
    }

    if (Logger.isCoralogixRumInited) {
      CoralogixRum.info(`LOG FROM: ${this.namespace}`, {
        ...args,
        namespace: this.namespace,
        userId: this.userId,
      });
    }
  }

  async sendDebug(...args: unknown[]) {
    await this.initializeCredentials();

    if (isServer) {
      const formattedData = this.formatData({
        ...args,
      });

      console.debug(formattedData);

      return;
    }

    if (Logger.isCoralogixRumInited) {
      CoralogixRum.debug(`LOG FROM: ${this.namespace}`, {
        ...args,
        namespace: this.namespace,
        userId: this.userId,
      });
    }
  }
}
