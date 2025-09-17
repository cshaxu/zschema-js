import * as z from "zod";

const JSON_SCHEMA_PRIMITIVE_BOOLEAN = "boolean" as const;
const JSON_SCHEMA_PRIMITIVE_DATE = "date" as const;
const JSON_SCHEMA_PRIMITIVE_JSON = "json" as const;
const JSON_SCHEMA_PRIMITIVE_NUMBER = "number" as const;
const JSON_SCHEMA_PRIMITIVE_STRING = "string" as const;

const JSON_SCHEMA_PRIMITIVES: string[] = [
  JSON_SCHEMA_PRIMITIVE_BOOLEAN,
  JSON_SCHEMA_PRIMITIVE_DATE,
  JSON_SCHEMA_PRIMITIVE_JSON,
  JSON_SCHEMA_PRIMITIVE_NUMBER,
  JSON_SCHEMA_PRIMITIVE_STRING,
];

// primitive types

type JsonSchemaPrimitive =
  | typeof JSON_SCHEMA_PRIMITIVE_BOOLEAN
  | typeof JSON_SCHEMA_PRIMITIVE_DATE
  | typeof JSON_SCHEMA_PRIMITIVE_JSON
  | typeof JSON_SCHEMA_PRIMITIVE_NUMBER
  | typeof JSON_SCHEMA_PRIMITIVE_STRING;
type JsonSchemaExtendedPrimitive = JsonSchemaPrimitive | string;
type JsonContentPrimitive =
  | boolean
  | number
  | string
  | Date
  | Record<string, any>;
type JsonZodPrimitive =
  | z.ZodBoolean
  | z.ZodNumber
  | z.ZodString
  | z.ZodDate
  | z.ZodRecord<z.ZodString, any>;
const isJsonSchemaPrimitive = (
  value: JsonSchemaValue,
  extension: JsonSchemaPrimitiveExtension = {}
): value is JsonSchemaExtendedPrimitive =>
  typeof value === "string" &&
  (JSON_SCHEMA_PRIMITIVES.includes(value) || value in extension);

// literal types

type JsonSchemaLiteral = `"${string}"`;
type JsonContentLiteral = string;
type JsonZodLiteral = z.ZodLiteral<string>;
const isJsonSchemaLiteral = (
  value: JsonSchemaValue
): value is JsonSchemaLiteral =>
  typeof value === "string" && value.startsWith('"') && value.endsWith('"');

// enum types

type JsonSchemaEnum = [JsonSchemaLiteral, ...JsonSchemaLiteral[]];
type JsonContentEnum = string;
type JsonZodEnum =
  | z.ZodLiteral<string>
  | z.ZodUnion<
      [z.ZodLiteral<string>, z.ZodLiteral<string>, ...z.ZodLiteral<string>[]]
    >;
const isJsonSchemaEnum = (type: JsonSchemaValue): type is JsonSchemaEnum =>
  Array.isArray(type) && type.length > 0 && type.every(isJsonSchemaLiteral);

// element types

type JsonSchemaElement =
  | JsonSchemaExtendedPrimitive // primary type
  | [JsonSchemaExtendedPrimitive] // array of primary type
  | JsonSchemaLiteral // literal
  | JsonSchemaEnum // enum
  | [JsonSchemaEnum]; // array of enum
type JsonContentElement =
  | JsonContentPrimitive // primary type
  | JsonContentPrimitive[] // array of primary type
  | JsonContentLiteral // literal
  | JsonContentEnum // enum
  | JsonContentEnum[]; // array of enum
const isJsonSchemaPrimitiveArray = (
  value: JsonSchemaValue,
  extension: JsonSchemaPrimitiveExtension = {}
): value is [JsonSchemaExtendedPrimitive] =>
  Array.isArray(value) &&
  value.length === 1 &&
  isJsonSchemaPrimitive(value[0], extension);
const isJsonSchemaEnumArray = (
  value: JsonSchemaValue
): value is [JsonSchemaEnum] =>
  Array.isArray(value) && value.length === 1 && isJsonSchemaEnum(value[0]);
const isJsonSchemaElement = (
  value: JsonSchemaValue,
  extension: JsonSchemaPrimitiveExtension = {}
): value is JsonSchemaElement =>
  isJsonSchemaPrimitive(value, extension) ||
  isJsonSchemaPrimitiveArray(value, extension) ||
  isJsonSchemaLiteral(value) ||
  isJsonSchemaEnum(value) ||
  isJsonSchemaEnumArray(value);

// nested object types

type JsonSchemaValue = JsonSchemaElement | JsonSchema | [JsonSchema];
type JsonContentValue =
  | JsonContentElement
  | JsonContent // nested object
  | JsonContent[]; // array of nested objects
const isJsonSchemaNestedObject = (
  value: JsonSchemaValue,
  extension: JsonSchemaPrimitiveExtension = {}
): value is JsonSchema =>
  !isJsonSchemaElement(value, extension) &&
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);
const isJsonSchemaNestedObjectArray = (
  value: JsonSchemaValue,
  extension: JsonSchemaPrimitiveExtension = {}
): value is [JsonSchema] =>
  Array.isArray(value) &&
  value.length === 1 &&
  isJsonSchemaNestedObject(value[0], extension);

type JsonSchema = { [key: string]: JsonSchemaValue };
type JsonContent = { [key: string]: JsonContentValue };
type JsonZod = z.ZodTypeAny;

type JsonSchemaPrimitiveExtensionValue = {
  type: JsonSchemaPrimitive;
  zod: JsonZodPrimitive;
};
type JsonSchemaPrimitiveExtension = Record<
  string,
  JsonSchemaPrimitiveExtensionValue
>;

function buildPrimaryZodObject(
  primitive: JsonSchemaExtendedPrimitive,
  extension: JsonSchemaPrimitiveExtension
): JsonZodPrimitive {
  switch (primitive) {
    case JSON_SCHEMA_PRIMITIVE_BOOLEAN:
      return z.boolean();
    case JSON_SCHEMA_PRIMITIVE_DATE:
      return z.coerce.date();
    case JSON_SCHEMA_PRIMITIVE_JSON:
      return z.record(z.string(), z.any());
    case JSON_SCHEMA_PRIMITIVE_NUMBER:
      return z.number();
    case JSON_SCHEMA_PRIMITIVE_STRING:
      return z.string();
    default:
      if (primitive in extension) {
        return extension[primitive].zod;
      }
      throw new Error(`Unsupported primary type: ${primitive}`);
  }
}
function buildPrimaryString(
  primitive: JsonSchemaExtendedPrimitive,
  extension: JsonSchemaPrimitiveExtension
): string {
  if (isJsonSchemaPrimitive(primitive, extension)) {
    return primitive;
  }
  throw new Error(`Unsupported primary type: ${primitive}`);
}

function buildLiteralZodObject(literal: JsonSchemaLiteral): JsonZodLiteral {
  if (isJsonSchemaLiteral(literal)) {
    return z.literal(literal.slice(1, -1));
  }
  throw new Error(`Unsupported literal type: ${literal}`);
}
function buildLiteralString(literal: JsonSchemaLiteral): string {
  if (isJsonSchemaLiteral(literal)) {
    return literal;
  }
  throw new Error(`Unsupported literal type: ${literal}`);
}

function buildPrimaryOrLiteralZodObject(
  value: JsonSchemaExtendedPrimitive | JsonSchemaLiteral,
  extension: JsonSchemaPrimitiveExtension
): JsonZodPrimitive | JsonZodLiteral {
  if (isJsonSchemaPrimitive(value, extension)) {
    return buildPrimaryZodObject(value, extension);
  } else if (isJsonSchemaLiteral(value)) {
    return buildLiteralZodObject(value);
  } else {
    throw new Error(`Unsupported type: ${value}`);
  }
}
function buildPrimaryOrLiteralString(
  value: JsonSchemaExtendedPrimitive | JsonSchemaLiteral,
  extension: JsonSchemaPrimitiveExtension
): string {
  if (isJsonSchemaPrimitive(value, extension)) {
    return buildPrimaryString(value, extension);
  } else if (isJsonSchemaLiteral(value)) {
    return buildLiteralString(value);
  } else {
    throw new Error(`Unsupported type: ${value}`);
  }
}

function buildEnumZodObject(literals: JsonSchemaEnum): JsonZodEnum {
  const isAllLiteral = literals.every(
    (v) => typeof v === "string" && v.startsWith('"') && v.endsWith('"')
  );
  if (!isAllLiteral) {
    throw new Error(`Unsupported enum type: [${literals.join("|")}]`);
  }
  if (literals.length === 0) {
    throw new Error("Unsupported enum type: []");
  } else if (literals.length === 1) {
    return buildLiteralZodObject(literals[0]);
  } else {
    return z.union(
      literals.map((v) => z.literal(v.slice(1, -1))) as [
        z.ZodLiteral<string>,
        z.ZodLiteral<string>,
        ...z.ZodLiteral<string>[]
      ]
    );
  }
}

function buildEnumString(literals: JsonSchemaEnum): string {
  const isAllLiteral = literals.every(
    (v) => typeof v === "string" && v.startsWith('"') && v.endsWith('"')
  );
  if (!isAllLiteral) {
    throw new Error(`Unsupported enum type: [${literals.join("|")}]`);
  }
  if (literals.length === 0) {
    throw new Error("Unsupported enum type: []");
  } else if (literals.length === 1) {
    return buildLiteralString(literals[0]);
  } else {
    return literals.join("|");
  }
}

function buildArrayOrEnumZodObject(
  value:
    | [JsonSchemaEnum]
    | [JsonSchemaExtendedPrimitive]
    | JsonSchemaEnum
    | JsonSchema[],
  extension: JsonSchemaPrimitiveExtension
): z.ZodTypeAny | JsonZodEnum {
  if (value.length === 0) {
    throw new Error("Unsupported type: []");
  }
  if (value.length === 1) {
    const v = value[0];
    if (typeof v === "object") {
      if (Array.isArray(v)) {
        // [JsonSchemaEnum]
        return buildEnumZodObject(v).array().catch([]);
      } else {
        // [JsonSchema]
        return jsonToZod(v, extension).array().catch([]);
      }
    } else if (typeof v === "string") {
      // [JsonSchemaPrimitive] or JsonSchemaEnum ([JsonSchemaLiteral])
      return (
        buildPrimaryOrLiteralZodObject(
          v as JsonSchemaExtendedPrimitive | JsonSchemaLiteral,
          extension
        ) as z.ZodTypeAny
      )
        .array()
        .catch([]);
    } else {
      throw new Error(`Unsupported type: ${value}`);
    }
  } else {
    // JsonSchemaEnum ([JsonSchemaLiteral, JsonSchemaLiteral, ...JsonSchemaLiteral[]])
    return buildEnumZodObject(value as JsonSchemaEnum);
  }
}

function buildArrayOrEnumString(
  value:
    | [JsonSchemaEnum]
    | [JsonSchemaExtendedPrimitive]
    | JsonSchemaEnum
    | JsonSchema[],
  extension: JsonSchemaPrimitiveExtension
): string {
  if (value.length === 0) {
    throw new Error("Unsupported type: []");
  }
  if (value.length === 1) {
    const v = value[0];
    if (typeof v === "object") {
      if (Array.isArray(v)) {
        // [JsonSchemaEnum]
        return `(${buildEnumString(v)})[]`;
      } else {
        // [JsonSchema]
        return `${jsonToString(v, extension)}[]`;
      }
    } else if (typeof v === "string") {
      if (isJsonSchemaPrimitive(v, extension)) {
        // [JsonSchemaPrimitive]
        return `${buildPrimaryString(v, extension)}[]`;
      } else if (isJsonSchemaLiteral(v)) {
        // JsonSchemaEnum ([JsonSchemaLiteral])
        return `(${buildLiteralString(v as JsonSchemaLiteral)})[]`;
      } else {
        throw new Error(`Unsupported type: ${value}`);
      }
    } else {
      throw new Error(`Unsupported type: ${value}`);
    }
  } else {
    // JsonSchemaEnum ([JsonSchemaLiteral, JsonSchemaLiteral, ...JsonSchemaLiteral[]])
    return buildEnumString(value as JsonSchemaEnum);
  }
}

function jsonToZod(
  json: JsonSchema,
  extension: JsonSchemaPrimitiveExtension = {}
): z.ZodTypeAny {
  return Object.entries(json).reduce((acc, [key, value]) => {
    let obj: z.ZodTypeAny;
    if (typeof value === "string") {
      obj = buildPrimaryOrLiteralZodObject(value, extension);
    } else if (typeof value === "object" && Array.isArray(value)) {
      obj = buildArrayOrEnumZodObject(value, extension);
    } else if (typeof value === "object" && Object.keys(value).length > 0) {
      obj = jsonToZod(value, extension);
    } else {
      throw new Error(`Unsupported type: ${value}`);
    }
    return acc.extend({ [key]: obj.optional().catch(undefined) });
  }, z.object({})) as z.ZodTypeAny;
}

function jsonToString(
  json: JsonSchema,
  extension: JsonSchemaPrimitiveExtension = {}
): string {
  const newJson = Object.entries(json).reduce((acc, [key, value]) => {
    let s: string;
    if (typeof value === "string") {
      s = buildPrimaryOrLiteralString(value, extension);
    } else if (typeof value === "object" && Array.isArray(value)) {
      s = buildArrayOrEnumString(value, extension);
    } else if (typeof value === "object" && Object.keys(value).length > 0) {
      s = jsonToString(value, extension);
    } else {
      throw new Error(`Unsupported type: ${value}`);
    }
    (acc as any)[key] = s;
    return acc;
  }, {} as any);
  return JSON.stringify(newJson)
    .replace(/\\"/g, "\u0001")
    .replace(/"/g, "")
    .replace(/\u0001/g, '"');
}

export {
  isJsonSchemaElement,
  isJsonSchemaEnum,
  isJsonSchemaEnumArray,
  isJsonSchemaLiteral,
  isJsonSchemaNestedObject,
  isJsonSchemaNestedObjectArray,
  isJsonSchemaPrimitive,
  isJsonSchemaPrimitiveArray,
  JSON_SCHEMA_PRIMITIVE_BOOLEAN,
  JSON_SCHEMA_PRIMITIVE_DATE,
  JSON_SCHEMA_PRIMITIVE_JSON,
  JSON_SCHEMA_PRIMITIVE_NUMBER,
  JSON_SCHEMA_PRIMITIVE_STRING,
  JSON_SCHEMA_PRIMITIVES,
  JsonContent,
  JsonContentElement,
  JsonContentEnum,
  JsonContentLiteral,
  JsonContentPrimitive,
  JsonContentValue,
  JsonSchema,
  JsonSchemaElement,
  JsonSchemaEnum,
  JsonSchemaExtendedPrimitive,
  JsonSchemaLiteral,
  JsonSchemaPrimitive,
  JsonSchemaPrimitiveExtension,
  JsonSchemaPrimitiveExtensionValue,
  JsonSchemaValue,
  jsonToString,
  jsonToZod,
  JsonZod,
  JsonZodEnum,
  JsonZodLiteral,
  JsonZodPrimitive,
};
