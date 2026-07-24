import type { ClassTransformOptions } from "class-transformer";
import { plainToInstance } from "class-transformer";

import { getAllGetterNames } from "@/utils/commons/helpers";
import { keysToCamelCase, keysToSnakeCase } from "@/utils/commons/string";

import { concat } from "../lodash-es";

type ClassType<T> = new () => T;

export class TransformerBuilder<T> {
  private readonly model: ClassType<T>;
  private instance: T | T[] | null = null;

  constructor(model: ClassType<T>) {
    this.model = model;
  }

  format(data: unknown, options?: ClassTransformOptions): this {
    this.instance = plainToInstance(this.model, data, options);

    return this;
  }

  getInstance() {
    return this.instance;
  }

  toPlainCamelCase(): T | T[] | null {
    if (!this.instance) {
      return null;
    }

    if (Array.isArray(this.instance)) {
      return this.instance.map((item) => {
        const plainObject = this.initPlainObject(
          item as Record<string, unknown>
        );
        return keysToCamelCase(plainObject);
      }) as T[];
    }
    const plainObject = this.initPlainObject(
      this.instance as Record<string, unknown>
    );

    return keysToCamelCase(plainObject) as T;
  }

  toPlainSnakeCase(): T | T[] | null {
    if (!this.instance) {
      return null;
    }

    if (Array.isArray(this.instance)) {
      return this.instance.map((item) => {
        const plainObject = this.initPlainObject(
          item as Record<string, unknown>
        );
        return keysToSnakeCase(plainObject);
      }) as T[];
    }
    const plainObject = this.initPlainObject(
      this.instance as Record<string, unknown>
    );

    return keysToSnakeCase(plainObject) as T;
  }

  // Reads own data properties AND class-getter properties directly off the
  // live instance. A prior version ran `structuredClone(this.instance)`
  // before this step to get an independent copy — but structuredClone
  // strips the prototype chain, so every @Expose()-decorated getter (e.g.
  // ConversationModel.path, SubscriptionModel.isValidPremiumUser) silently
  // came back as undefined. Reading straight off the live instance fixes
  // that; independence from the source is preserved because this method
  // only ever reads `obj` and builds a brand new object/array tree — it
  // never mutates `obj` itself.
  private initPlainObject(
    obj: Record<string, unknown>
  ): Record<string, unknown> {
    const plainObject: Record<string, unknown> = {};
    const getterNames = [...getAllGetterNames(obj)] as string[];
    const propertyNames = Object.getOwnPropertyNames(obj);
    const allProperties = concat(propertyNames, getterNames) as string[];

    for (const key of allProperties) {
      let value: unknown;
      try {
        value = obj[key];
      } catch (error) {
        console.warn(
          `[TransformerBuilder] Failed to read property "${key}":`,
          error
        );
        continue;
      }

      if (Array.isArray(value)) {
        plainObject[key] = value.map((item) =>
          item && typeof item === "object"
            ? this.initPlainObject(item as Record<string, unknown>)
            : item
        );
      } else if (value && typeof value === "object") {
        plainObject[key] = this.initPlainObject(
          value as Record<string, unknown>
        );
      } else {
        plainObject[key] = value;
      }
    }

    return plainObject;
  }
}
