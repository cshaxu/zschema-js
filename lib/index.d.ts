import * as z from "zod";
declare const JSON_SCHEMA_PRIMITIVE_BOOLEAN: "boolean";
declare const JSON_SCHEMA_PRIMITIVE_DATE: "date";
declare const JSON_SCHEMA_PRIMITIVE_JSON: "json";
declare const JSON_SCHEMA_PRIMITIVE_NUMBER: "number";
declare const JSON_SCHEMA_PRIMITIVE_STRING: "string";
declare const JSON_SCHEMA_PRIMITIVES: string[];
type JsonSchemaPrimitive = typeof JSON_SCHEMA_PRIMITIVE_BOOLEAN | typeof JSON_SCHEMA_PRIMITIVE_DATE | typeof JSON_SCHEMA_PRIMITIVE_JSON | typeof JSON_SCHEMA_PRIMITIVE_NUMBER | typeof JSON_SCHEMA_PRIMITIVE_STRING;
type JsonSchemaExtendedPrimitive = JsonSchemaPrimitive | string;
type JsonContentPrimitive = boolean | number | string | Date | Record<string, any>;
type JsonZodPrimitive = z.ZodBoolean | z.ZodNumber | z.ZodString | z.ZodDate | z.ZodRecord<z.ZodString, any>;
declare const isJsonSchemaPrimitive: (value: JsonSchemaValue, extension?: JsonSchemaPrimitiveExtension) => value is JsonSchemaExtendedPrimitive;
type JsonSchemaLiteral = `"${string}"`;
type JsonContentLiteral = string;
type JsonZodLiteral = z.ZodLiteral<string>;
declare const isJsonSchemaLiteral: (value: JsonSchemaValue) => value is JsonSchemaLiteral;
type JsonSchemaEnum = [JsonSchemaLiteral, ...JsonSchemaLiteral[]];
type JsonContentEnum = string;
type JsonZodEnum = z.ZodLiteral<string> | z.ZodUnion<[
    z.ZodLiteral<string>,
    z.ZodLiteral<string>,
    ...z.ZodLiteral<string>[]
]>;
declare const isJsonSchemaEnum: (type: JsonSchemaValue) => type is JsonSchemaEnum;
type JsonSchemaElement = JsonSchemaExtendedPrimitive | [JsonSchemaExtendedPrimitive] | JsonSchemaLiteral | JsonSchemaEnum | [JsonSchemaEnum];
type JsonContentElement = JsonContentPrimitive | JsonContentPrimitive[] | JsonContentLiteral | JsonContentEnum | JsonContentEnum[];
declare const isJsonSchemaPrimitiveArray: (value: JsonSchemaValue, extension?: JsonSchemaPrimitiveExtension) => value is [JsonSchemaExtendedPrimitive];
declare const isJsonSchemaEnumArray: (value: JsonSchemaValue) => value is [JsonSchemaEnum];
declare const isJsonSchemaElement: (value: JsonSchemaValue, extension?: JsonSchemaPrimitiveExtension) => value is JsonSchemaElement;
type JsonSchemaValue = JsonSchemaElement | JsonSchema | [JsonSchema];
type JsonContentValue = JsonContentElement | JsonContent | JsonContent[];
declare const isJsonSchemaNestedObject: (value: JsonSchemaValue, extension?: JsonSchemaPrimitiveExtension) => value is JsonSchema;
declare const isJsonSchemaNestedObjectArray: (value: JsonSchemaValue, extension?: JsonSchemaPrimitiveExtension) => value is [JsonSchema];
type JsonSchema = {
    [key: string]: JsonSchemaValue;
};
type JsonContent = {
    [key: string]: JsonContentValue;
};
type JsonZod = z.ZodTypeAny;
type JsonSchemaPrimitiveExtensionValue = {
    type: JsonSchemaPrimitive;
    zod: JsonZodPrimitive;
};
type JsonSchemaPrimitiveExtension = Record<string, JsonSchemaPrimitiveExtensionValue>;
declare function jsonToZod(json: JsonSchema, extension?: JsonSchemaPrimitiveExtension): z.ZodTypeAny;
declare function jsonToString(json: JsonSchema, extension?: JsonSchemaPrimitiveExtension): string;
export { isJsonSchemaElement, isJsonSchemaEnum, isJsonSchemaEnumArray, isJsonSchemaLiteral, isJsonSchemaNestedObject, isJsonSchemaNestedObjectArray, isJsonSchemaPrimitive, isJsonSchemaPrimitiveArray, JSON_SCHEMA_PRIMITIVE_BOOLEAN, JSON_SCHEMA_PRIMITIVE_DATE, JSON_SCHEMA_PRIMITIVE_JSON, JSON_SCHEMA_PRIMITIVE_NUMBER, JSON_SCHEMA_PRIMITIVE_STRING, JSON_SCHEMA_PRIMITIVES, JsonContent, JsonContentElement, JsonContentEnum, JsonContentLiteral, JsonContentPrimitive, JsonContentValue, JsonSchema, JsonSchemaElement, JsonSchemaEnum, JsonSchemaExtendedPrimitive, JsonSchemaLiteral, JsonSchemaPrimitive, JsonSchemaPrimitiveExtension, JsonSchemaPrimitiveExtensionValue, JsonSchemaValue, jsonToString, jsonToZod, JsonZod, JsonZodEnum, JsonZodLiteral, JsonZodPrimitive, };
