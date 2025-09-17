"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSON_SCHEMA_PRIMITIVES = exports.JSON_SCHEMA_PRIMITIVE_STRING = exports.JSON_SCHEMA_PRIMITIVE_NUMBER = exports.JSON_SCHEMA_PRIMITIVE_JSON = exports.JSON_SCHEMA_PRIMITIVE_DATE = exports.JSON_SCHEMA_PRIMITIVE_BOOLEAN = exports.isJsonSchemaPrimitiveArray = exports.isJsonSchemaPrimitive = exports.isJsonSchemaNestedObjectArray = exports.isJsonSchemaNestedObject = exports.isJsonSchemaLiteral = exports.isJsonSchemaEnumArray = exports.isJsonSchemaEnum = exports.isJsonSchemaElement = void 0;
exports.jsonToString = jsonToString;
exports.jsonToZod = jsonToZod;
const z = __importStar(require("zod"));
const JSON_SCHEMA_PRIMITIVE_BOOLEAN = "boolean";
exports.JSON_SCHEMA_PRIMITIVE_BOOLEAN = JSON_SCHEMA_PRIMITIVE_BOOLEAN;
const JSON_SCHEMA_PRIMITIVE_DATE = "date";
exports.JSON_SCHEMA_PRIMITIVE_DATE = JSON_SCHEMA_PRIMITIVE_DATE;
const JSON_SCHEMA_PRIMITIVE_JSON = "json";
exports.JSON_SCHEMA_PRIMITIVE_JSON = JSON_SCHEMA_PRIMITIVE_JSON;
const JSON_SCHEMA_PRIMITIVE_NUMBER = "number";
exports.JSON_SCHEMA_PRIMITIVE_NUMBER = JSON_SCHEMA_PRIMITIVE_NUMBER;
const JSON_SCHEMA_PRIMITIVE_STRING = "string";
exports.JSON_SCHEMA_PRIMITIVE_STRING = JSON_SCHEMA_PRIMITIVE_STRING;
const JSON_SCHEMA_PRIMITIVES = [
    JSON_SCHEMA_PRIMITIVE_BOOLEAN,
    JSON_SCHEMA_PRIMITIVE_DATE,
    JSON_SCHEMA_PRIMITIVE_JSON,
    JSON_SCHEMA_PRIMITIVE_NUMBER,
    JSON_SCHEMA_PRIMITIVE_STRING,
];
exports.JSON_SCHEMA_PRIMITIVES = JSON_SCHEMA_PRIMITIVES;
const isJsonSchemaPrimitive = (value, extension = {}) => typeof value === "string" &&
    (JSON_SCHEMA_PRIMITIVES.includes(value) || value in extension);
exports.isJsonSchemaPrimitive = isJsonSchemaPrimitive;
const isJsonSchemaLiteral = (value) => typeof value === "string" && value.startsWith('"') && value.endsWith('"');
exports.isJsonSchemaLiteral = isJsonSchemaLiteral;
const isJsonSchemaEnum = (type) => Array.isArray(type) && type.length > 0 && type.every(isJsonSchemaLiteral);
exports.isJsonSchemaEnum = isJsonSchemaEnum;
const isJsonSchemaPrimitiveArray = (value, extension = {}) => Array.isArray(value) &&
    value.length === 1 &&
    isJsonSchemaPrimitive(value[0], extension);
exports.isJsonSchemaPrimitiveArray = isJsonSchemaPrimitiveArray;
const isJsonSchemaEnumArray = (value) => Array.isArray(value) && value.length === 1 && isJsonSchemaEnum(value[0]);
exports.isJsonSchemaEnumArray = isJsonSchemaEnumArray;
const isJsonSchemaElement = (value, extension = {}) => isJsonSchemaPrimitive(value, extension) ||
    isJsonSchemaPrimitiveArray(value, extension) ||
    isJsonSchemaLiteral(value) ||
    isJsonSchemaEnum(value) ||
    isJsonSchemaEnumArray(value);
exports.isJsonSchemaElement = isJsonSchemaElement;
const isJsonSchemaNestedObject = (value, extension = {}) => !isJsonSchemaElement(value, extension) &&
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value);
exports.isJsonSchemaNestedObject = isJsonSchemaNestedObject;
const isJsonSchemaNestedObjectArray = (value, extension = {}) => Array.isArray(value) &&
    value.length === 1 &&
    isJsonSchemaNestedObject(value[0], extension);
exports.isJsonSchemaNestedObjectArray = isJsonSchemaNestedObjectArray;
function buildPrimaryZodObject(primitive, extension) {
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
function buildPrimaryString(primitive, extension) {
    if (isJsonSchemaPrimitive(primitive, extension)) {
        return primitive;
    }
    throw new Error(`Unsupported primary type: ${primitive}`);
}
function buildLiteralZodObject(literal) {
    if (isJsonSchemaLiteral(literal)) {
        return z.literal(literal.slice(1, -1));
    }
    throw new Error(`Unsupported literal type: ${literal}`);
}
function buildLiteralString(literal) {
    if (isJsonSchemaLiteral(literal)) {
        return literal;
    }
    throw new Error(`Unsupported literal type: ${literal}`);
}
function buildPrimaryOrLiteralZodObject(value, extension) {
    if (isJsonSchemaPrimitive(value, extension)) {
        return buildPrimaryZodObject(value, extension);
    }
    else if (isJsonSchemaLiteral(value)) {
        return buildLiteralZodObject(value);
    }
    else {
        throw new Error(`Unsupported type: ${value}`);
    }
}
function buildPrimaryOrLiteralString(value, extension) {
    if (isJsonSchemaPrimitive(value, extension)) {
        return buildPrimaryString(value, extension);
    }
    else if (isJsonSchemaLiteral(value)) {
        return buildLiteralString(value);
    }
    else {
        throw new Error(`Unsupported type: ${value}`);
    }
}
function buildEnumZodObject(literals) {
    const isAllLiteral = literals.every((v) => typeof v === "string" && v.startsWith('"') && v.endsWith('"'));
    if (!isAllLiteral) {
        throw new Error(`Unsupported enum type: [${literals.join("|")}]`);
    }
    if (literals.length === 0) {
        throw new Error("Unsupported enum type: []");
    }
    else if (literals.length === 1) {
        return buildLiteralZodObject(literals[0]);
    }
    else {
        return z.union(literals.map((v) => z.literal(v.slice(1, -1))));
    }
}
function buildEnumString(literals) {
    const isAllLiteral = literals.every((v) => typeof v === "string" && v.startsWith('"') && v.endsWith('"'));
    if (!isAllLiteral) {
        throw new Error(`Unsupported enum type: [${literals.join("|")}]`);
    }
    if (literals.length === 0) {
        throw new Error("Unsupported enum type: []");
    }
    else if (literals.length === 1) {
        return buildLiteralString(literals[0]);
    }
    else {
        return literals.join("|");
    }
}
function buildArrayOrEnumZodObject(value, extension) {
    if (value.length === 0) {
        throw new Error("Unsupported type: []");
    }
    if (value.length === 1) {
        const v = value[0];
        if (typeof v === "object") {
            if (Array.isArray(v)) {
                // [JsonSchemaEnum]
                return buildEnumZodObject(v).array().catch([]);
            }
            else {
                // [JsonSchema]
                return jsonToZod(v, extension).array().catch([]);
            }
        }
        else if (typeof v === "string") {
            // [JsonSchemaPrimitive] or JsonSchemaEnum ([JsonSchemaLiteral])
            return buildPrimaryOrLiteralZodObject(v, extension)
                .array()
                .catch([]);
        }
        else {
            throw new Error(`Unsupported type: ${value}`);
        }
    }
    else {
        // JsonSchemaEnum ([JsonSchemaLiteral, JsonSchemaLiteral, ...JsonSchemaLiteral[]])
        return buildEnumZodObject(value);
    }
}
function buildArrayOrEnumString(value, extension) {
    if (value.length === 0) {
        throw new Error("Unsupported type: []");
    }
    if (value.length === 1) {
        const v = value[0];
        if (typeof v === "object") {
            if (Array.isArray(v)) {
                // [JsonSchemaEnum]
                return `(${buildEnumString(v)})[]`;
            }
            else {
                // [JsonSchema]
                return `${jsonToString(v, extension)}[]`;
            }
        }
        else if (typeof v === "string") {
            if (isJsonSchemaPrimitive(v, extension)) {
                // [JsonSchemaPrimitive]
                return `${buildPrimaryString(v, extension)}[]`;
            }
            else if (isJsonSchemaLiteral(v)) {
                // JsonSchemaEnum ([JsonSchemaLiteral])
                return `(${buildLiteralString(v)})[]`;
            }
            else {
                throw new Error(`Unsupported type: ${value}`);
            }
        }
        else {
            throw new Error(`Unsupported type: ${value}`);
        }
    }
    else {
        // JsonSchemaEnum ([JsonSchemaLiteral, JsonSchemaLiteral, ...JsonSchemaLiteral[]])
        return buildEnumString(value);
    }
}
function jsonToZod(json, extension = {}) {
    return Object.entries(json).reduce((acc, [key, value]) => {
        let obj;
        if (typeof value === "string") {
            obj = buildPrimaryOrLiteralZodObject(value, extension);
        }
        else if (typeof value === "object" && Array.isArray(value)) {
            obj = buildArrayOrEnumZodObject(value, extension);
        }
        else if (typeof value === "object" && Object.keys(value).length > 0) {
            obj = jsonToZod(value, extension);
        }
        else {
            throw new Error(`Unsupported type: ${value}`);
        }
        return acc.extend({ [key]: obj.optional().catch(undefined) });
    }, z.object({}));
}
function jsonToString(json, extension = {}) {
    const newJson = Object.entries(json).reduce((acc, [key, value]) => {
        let s;
        if (typeof value === "string") {
            s = buildPrimaryOrLiteralString(value, extension);
        }
        else if (typeof value === "object" && Array.isArray(value)) {
            s = buildArrayOrEnumString(value, extension);
        }
        else if (typeof value === "object" && Object.keys(value).length > 0) {
            s = jsonToString(value, extension);
        }
        else {
            throw new Error(`Unsupported type: ${value}`);
        }
        acc[key] = s;
        return acc;
    }, {});
    return JSON.stringify(newJson)
        .replace(/\\"/g, "\u0001")
        .replace(/"/g, "")
        .replace(/\u0001/g, '"');
}
//# sourceMappingURL=index.js.map