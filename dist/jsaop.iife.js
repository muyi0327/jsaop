/**
 * jsaop.js v1.0.4
 * (c) 2021-2021 muyi0327 <yfdezhuye@163.com> (https://github.com/muyi0327)
 * Released under the MIT License.
 */

var JSAOP = (function (exports) {
    'use strict'

    var commonjsGlobal =
        typeof globalThis !== 'undefined'
            ? globalThis
            : typeof window !== 'undefined'
            ? window
            : typeof global !== 'undefined'
            ? global
            : typeof self !== 'undefined'
            ? self
            : {}

    /*! *****************************************************************************
	Copyright (C) Microsoft. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */

    var Reflect$1
    ;(function (Reflect) {
        // Metadata Proposal
        // https://rbuckton.github.io/reflect-metadata/
        ;(function (factory) {
            var root =
                typeof commonjsGlobal === 'object'
                    ? commonjsGlobal
                    : typeof self === 'object'
                    ? self
                    : typeof this === 'object'
                    ? this
                    : Function('return this;')()
            var exporter = makeExporter(Reflect)
            if (typeof root.Reflect === 'undefined') {
                root.Reflect = Reflect
            } else {
                exporter = makeExporter(root.Reflect, exporter)
            }
            factory(exporter)
            function makeExporter(target, previous) {
                return function (key, value) {
                    if (typeof target[key] !== 'function') {
                        Object.defineProperty(target, key, { configurable: true, writable: true, value: value })
                    }
                    if (previous) previous(key, value)
                }
            }
        })(function (exporter) {
            var hasOwn = Object.prototype.hasOwnProperty
            // feature test for Symbol support
            var supportsSymbol = typeof Symbol === 'function'
            var toPrimitiveSymbol =
                supportsSymbol && typeof Symbol.toPrimitive !== 'undefined' ? Symbol.toPrimitive : '@@toPrimitive'
            var iteratorSymbol =
                supportsSymbol && typeof Symbol.iterator !== 'undefined' ? Symbol.iterator : '@@iterator'
            var supportsCreate = typeof Object.create === 'function' // feature test for Object.create support
            var supportsProto = { __proto__: [] } instanceof Array // feature test for __proto__ support
            var downLevel = !supportsCreate && !supportsProto
            var HashMap = {
                // create an object in dictionary mode (a.k.a. "slow" mode in v8)
                create: supportsCreate
                    ? function () {
                          return MakeDictionary(Object.create(null))
                      }
                    : supportsProto
                    ? function () {
                          return MakeDictionary({ __proto__: null })
                      }
                    : function () {
                          return MakeDictionary({})
                      },
                has: downLevel
                    ? function (map, key) {
                          return hasOwn.call(map, key)
                      }
                    : function (map, key) {
                          return key in map
                      },
                get: downLevel
                    ? function (map, key) {
                          return hasOwn.call(map, key) ? map[key] : undefined
                      }
                    : function (map, key) {
                          return map[key]
                      }
            }
            // Load global or shim versions of Map, Set, and WeakMap
            var functionPrototype = Object.getPrototypeOf(Function)
            var usePolyfill =
                typeof process === 'object' &&
                process.env &&
                process.env['REFLECT_METADATA_USE_MAP_POLYFILL'] === 'true'
            var _Map =
                !usePolyfill && typeof Map === 'function' && typeof Map.prototype.entries === 'function'
                    ? Map
                    : CreateMapPolyfill()
            var _Set =
                !usePolyfill && typeof Set === 'function' && typeof Set.prototype.entries === 'function'
                    ? Set
                    : CreateSetPolyfill()
            var _WeakMap = !usePolyfill && typeof WeakMap === 'function' ? WeakMap : CreateWeakMapPolyfill()
            // [[Metadata]] internal slot
            // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
            var Metadata = new _WeakMap()
            /**
             * Applies a set of decorators to a property of a target object.
             * @param decorators An array of decorators.
             * @param target The target object.
             * @param propertyKey (Optional) The property key to decorate.
             * @param attributes (Optional) The property descriptor for the target key.
             * @remarks Decorators are applied in reverse order.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     Example = Reflect.decorate(decoratorsArray, Example);
             *
             *     // property (on constructor)
             *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
             *
             *     // property (on prototype)
             *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
             *
             *     // method (on constructor)
             *     Object.defineProperty(Example, "staticMethod",
             *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
             *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
             *
             *     // method (on prototype)
             *     Object.defineProperty(Example.prototype, "method",
             *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
             *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
             *
             */
            function decorate(decorators, target, propertyKey, attributes) {
                if (!IsUndefined(propertyKey)) {
                    if (!IsArray(decorators)) throw new TypeError()
                    if (!IsObject(target)) throw new TypeError()
                    if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes)) throw new TypeError()
                    if (IsNull(attributes)) attributes = undefined
                    propertyKey = ToPropertyKey(propertyKey)
                    return DecorateProperty(decorators, target, propertyKey, attributes)
                } else {
                    if (!IsArray(decorators)) throw new TypeError()
                    if (!IsConstructor(target)) throw new TypeError()
                    return DecorateConstructor(decorators, target)
                }
            }
            exporter('decorate', decorate)
            // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
            // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
            /**
             * A default metadata decorator factory that can be used on a class, class member, or parameter.
             * @param metadataKey The key for the metadata entry.
             * @param metadataValue The value for the metadata entry.
             * @returns A decorator function.
             * @remarks
             * If `metadataKey` is already defined for the target and target key, the
             * metadataValue for that key will be overwritten.
             * @example
             *
             *     // constructor
             *     @Reflect.metadata(key, value)
             *     class Example {
             *     }
             *
             *     // property (on constructor, TypeScript only)
             *     class Example {
             *         @Reflect.metadata(key, value)
             *         static staticProperty;
             *     }
             *
             *     // property (on prototype, TypeScript only)
             *     class Example {
             *         @Reflect.metadata(key, value)
             *         property;
             *     }
             *
             *     // method (on constructor)
             *     class Example {
             *         @Reflect.metadata(key, value)
             *         static staticMethod() { }
             *     }
             *
             *     // method (on prototype)
             *     class Example {
             *         @Reflect.metadata(key, value)
             *         method() { }
             *     }
             *
             */
            function metadata(metadataKey, metadataValue) {
                function decorator(target, propertyKey) {
                    if (!IsObject(target)) throw new TypeError()
                    if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey)) throw new TypeError()
                    OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey)
                }
                return decorator
            }
            exporter('metadata', metadata)
            /**
             * Define a unique metadata entry on the target.
             * @param metadataKey A key used to store and retrieve metadata.
             * @param metadataValue A value that contains attached metadata.
             * @param target The target object on which to define metadata.
             * @param propertyKey (Optional) The property key for the target.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     Reflect.defineMetadata("custom:annotation", options, Example);
             *
             *     // property (on constructor)
             *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
             *
             *     // property (on prototype)
             *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
             *
             *     // method (on constructor)
             *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
             *
             *     // method (on prototype)
             *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
             *
             *     // decorator factory as metadata-producing annotation.
             *     function MyAnnotation(options): Decorator {
             *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
             *     }
             *
             */
            function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
                if (!IsObject(target)) throw new TypeError()
                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey)
                return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey)
            }
            exporter('defineMetadata', defineMetadata)
            /**
             * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
             * @param metadataKey A key used to store and retrieve metadata.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.hasMetadata("custom:annotation", Example);
             *
             *     // property (on constructor)
             *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
             *
             */
            function hasMetadata(metadataKey, target, propertyKey) {
                if (!IsObject(target)) throw new TypeError()
                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey)
                return OrdinaryHasMetadata(metadataKey, target, propertyKey)
            }
            exporter('hasMetadata', hasMetadata)
            /**
             * Gets a value indicating whether the target object has the provided metadata key defined.
             * @param metadataKey A key used to store and retrieve metadata.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
             *
             *     // property (on constructor)
             *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
             *
             */
            function hasOwnMetadata(metadataKey, target, propertyKey) {
                if (!IsObject(target)) throw new TypeError()
                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey)
                return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey)
            }
            exporter('hasOwnMetadata', hasOwnMetadata)
            /**
             * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
             * @param metadataKey A key used to store and retrieve metadata.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.getMetadata("custom:annotation", Example);
             *
             *     // property (on constructor)
             *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
             *
             */
            function getMetadata(metadataKey, target, propertyKey) {
                if (!IsObject(target)) throw new TypeError()
                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey)
                return OrdinaryGetMetadata(metadataKey, target, propertyKey)
            }
            exporter('getMetadata', getMetadata)
            /**
             * Gets the metadata value for the provided metadata key on the target object.
             * @param metadataKey A key used to store and retrieve metadata.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.getOwnMetadata("custom:annotation", Example);
             *
             *     // property (on constructor)
             *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
             *
             */
            function getOwnMetadata(metadataKey, target, propertyKey) {
                if (!IsObject(target)) throw new TypeError()
                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey)
                return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey)
            }
            exporter('getOwnMetadata', getOwnMetadata)
            /**
             * Gets the metadata keys defined on the target object or its prototype chain.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns An array of unique metadata keys.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.getMetadataKeys(Example);
             *
             *     // property (on constructor)
             *     result = Reflect.getMetadataKeys(Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.getMetadataKeys(Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.getMetadataKeys(Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.getMetadataKeys(Example.prototype, "method");
             *
             */
            function getMetadataKeys(target, propertyKey) {
                if (!IsObject(target)) throw new TypeError()
                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey)
                return OrdinaryMetadataKeys(target, propertyKey)
            }
            exporter('getMetadataKeys', getMetadataKeys)
            /**
             * Gets the unique metadata keys defined on the target object.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns An array of unique metadata keys.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.getOwnMetadataKeys(Example);
             *
             *     // property (on constructor)
             *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
             *
             */
            function getOwnMetadataKeys(target, propertyKey) {
                if (!IsObject(target)) throw new TypeError()
                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey)
                return OrdinaryOwnMetadataKeys(target, propertyKey)
            }
            exporter('getOwnMetadataKeys', getOwnMetadataKeys)
            /**
             * Deletes the metadata entry from the target object with the provided key.
             * @param metadataKey A key used to store and retrieve metadata.
             * @param target The target object on which the metadata is defined.
             * @param propertyKey (Optional) The property key for the target.
             * @returns `true` if the metadata entry was found and deleted; otherwise, false.
             * @example
             *
             *     class Example {
             *         // property declarations are not part of ES6, though they are valid in TypeScript:
             *         // static staticProperty;
             *         // property;
             *
             *         constructor(p) { }
             *         static staticMethod(p) { }
             *         method(p) { }
             *     }
             *
             *     // constructor
             *     result = Reflect.deleteMetadata("custom:annotation", Example);
             *
             *     // property (on constructor)
             *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
             *
             *     // property (on prototype)
             *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
             *
             *     // method (on constructor)
             *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
             *
             *     // method (on prototype)
             *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
             *
             */
            function deleteMetadata(metadataKey, target, propertyKey) {
                if (!IsObject(target)) throw new TypeError()
                if (!IsUndefined(propertyKey)) propertyKey = ToPropertyKey(propertyKey)
                var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false)
                if (IsUndefined(metadataMap)) return false
                if (!metadataMap.delete(metadataKey)) return false
                if (metadataMap.size > 0) return true
                var targetMetadata = Metadata.get(target)
                targetMetadata.delete(propertyKey)
                if (targetMetadata.size > 0) return true
                Metadata.delete(target)
                return true
            }
            exporter('deleteMetadata', deleteMetadata)
            function DecorateConstructor(decorators, target) {
                for (var i = decorators.length - 1; i >= 0; --i) {
                    var decorator = decorators[i]
                    var decorated = decorator(target)
                    if (!IsUndefined(decorated) && !IsNull(decorated)) {
                        if (!IsConstructor(decorated)) throw new TypeError()
                        target = decorated
                    }
                }
                return target
            }
            function DecorateProperty(decorators, target, propertyKey, descriptor) {
                for (var i = decorators.length - 1; i >= 0; --i) {
                    var decorator = decorators[i]
                    var decorated = decorator(target, propertyKey, descriptor)
                    if (!IsUndefined(decorated) && !IsNull(decorated)) {
                        if (!IsObject(decorated)) throw new TypeError()
                        descriptor = decorated
                    }
                }
                return descriptor
            }
            function GetOrCreateMetadataMap(O, P, Create) {
                var targetMetadata = Metadata.get(O)
                if (IsUndefined(targetMetadata)) {
                    if (!Create) return undefined
                    targetMetadata = new _Map()
                    Metadata.set(O, targetMetadata)
                }
                var metadataMap = targetMetadata.get(P)
                if (IsUndefined(metadataMap)) {
                    if (!Create) return undefined
                    metadataMap = new _Map()
                    targetMetadata.set(P, metadataMap)
                }
                return metadataMap
            }
            // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
            function OrdinaryHasMetadata(MetadataKey, O, P) {
                var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P)
                if (hasOwn) return true
                var parent = OrdinaryGetPrototypeOf(O)
                if (!IsNull(parent)) return OrdinaryHasMetadata(MetadataKey, parent, P)
                return false
            }
            // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
            function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false)
                if (IsUndefined(metadataMap)) return false
                return ToBoolean(metadataMap.has(MetadataKey))
            }
            // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
            function OrdinaryGetMetadata(MetadataKey, O, P) {
                var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P)
                if (hasOwn) return OrdinaryGetOwnMetadata(MetadataKey, O, P)
                var parent = OrdinaryGetPrototypeOf(O)
                if (!IsNull(parent)) return OrdinaryGetMetadata(MetadataKey, parent, P)
                return undefined
            }
            // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
            function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false)
                if (IsUndefined(metadataMap)) return undefined
                return metadataMap.get(MetadataKey)
            }
            // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
            function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true)
                metadataMap.set(MetadataKey, MetadataValue)
            }
            // 3.1.6.1 OrdinaryMetadataKeys(O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
            function OrdinaryMetadataKeys(O, P) {
                var ownKeys = OrdinaryOwnMetadataKeys(O, P)
                var parent = OrdinaryGetPrototypeOf(O)
                if (parent === null) return ownKeys
                var parentKeys = OrdinaryMetadataKeys(parent, P)
                if (parentKeys.length <= 0) return ownKeys
                if (ownKeys.length <= 0) return parentKeys
                var set = new _Set()
                var keys = []
                for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
                    var key = ownKeys_1[_i]
                    var hasKey = set.has(key)
                    if (!hasKey) {
                        set.add(key)
                        keys.push(key)
                    }
                }
                for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
                    var key = parentKeys_1[_a]
                    var hasKey = set.has(key)
                    if (!hasKey) {
                        set.add(key)
                        keys.push(key)
                    }
                }
                return keys
            }
            // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
            function OrdinaryOwnMetadataKeys(O, P) {
                var keys = []
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false)
                if (IsUndefined(metadataMap)) return keys
                var keysObj = metadataMap.keys()
                var iterator = GetIterator(keysObj)
                var k = 0
                while (true) {
                    var next = IteratorStep(iterator)
                    if (!next) {
                        keys.length = k
                        return keys
                    }
                    var nextValue = IteratorValue(next)
                    try {
                        keys[k] = nextValue
                    } catch (e) {
                        try {
                            IteratorClose(iterator)
                        } finally {
                            throw e
                        }
                    }
                    k++
                }
            }
            // 6 ECMAScript Data Typ0es and Values
            // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
            function Type(x) {
                if (x === null) return 1 /* Null */
                switch (typeof x) {
                    case 'undefined':
                        return 0 /* Undefined */
                    case 'boolean':
                        return 2 /* Boolean */
                    case 'string':
                        return 3 /* String */
                    case 'symbol':
                        return 4 /* Symbol */
                    case 'number':
                        return 5 /* Number */
                    case 'object':
                        return x === null ? 1 /* Null */ : 6 /* Object */
                    default:
                        return 6 /* Object */
                }
            }
            // 6.1.1 The Undefined Type
            // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
            function IsUndefined(x) {
                return x === undefined
            }
            // 6.1.2 The Null Type
            // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
            function IsNull(x) {
                return x === null
            }
            // 6.1.5 The Symbol Type
            // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
            function IsSymbol(x) {
                return typeof x === 'symbol'
            }
            // 6.1.7 The Object Type
            // https://tc39.github.io/ecma262/#sec-object-type
            function IsObject(x) {
                return typeof x === 'object' ? x !== null : typeof x === 'function'
            }
            // 7.1 Type Conversion
            // https://tc39.github.io/ecma262/#sec-type-conversion
            // 7.1.1 ToPrimitive(input [, PreferredType])
            // https://tc39.github.io/ecma262/#sec-toprimitive
            function ToPrimitive(input, PreferredType) {
                switch (Type(input)) {
                    case 0 /* Undefined */:
                        return input
                    case 1 /* Null */:
                        return input
                    case 2 /* Boolean */:
                        return input
                    case 3 /* String */:
                        return input
                    case 4 /* Symbol */:
                        return input
                    case 5 /* Number */:
                        return input
                }
                var hint =
                    PreferredType === 3 /* String */
                        ? 'string'
                        : PreferredType === 5 /* Number */
                        ? 'number'
                        : 'default'
                var exoticToPrim = GetMethod(input, toPrimitiveSymbol)
                if (exoticToPrim !== undefined) {
                    var result = exoticToPrim.call(input, hint)
                    if (IsObject(result)) throw new TypeError()
                    return result
                }
                return OrdinaryToPrimitive(input, hint === 'default' ? 'number' : hint)
            }
            // 7.1.1.1 OrdinaryToPrimitive(O, hint)
            // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
            function OrdinaryToPrimitive(O, hint) {
                if (hint === 'string') {
                    var toString_1 = O.toString
                    if (IsCallable(toString_1)) {
                        var result = toString_1.call(O)
                        if (!IsObject(result)) return result
                    }
                    var valueOf = O.valueOf
                    if (IsCallable(valueOf)) {
                        var result = valueOf.call(O)
                        if (!IsObject(result)) return result
                    }
                } else {
                    var valueOf = O.valueOf
                    if (IsCallable(valueOf)) {
                        var result = valueOf.call(O)
                        if (!IsObject(result)) return result
                    }
                    var toString_2 = O.toString
                    if (IsCallable(toString_2)) {
                        var result = toString_2.call(O)
                        if (!IsObject(result)) return result
                    }
                }
                throw new TypeError()
            }
            // 7.1.2 ToBoolean(argument)
            // https://tc39.github.io/ecma262/2016/#sec-toboolean
            function ToBoolean(argument) {
                return !!argument
            }
            // 7.1.12 ToString(argument)
            // https://tc39.github.io/ecma262/#sec-tostring
            function ToString(argument) {
                return '' + argument
            }
            // 7.1.14 ToPropertyKey(argument)
            // https://tc39.github.io/ecma262/#sec-topropertykey
            function ToPropertyKey(argument) {
                var key = ToPrimitive(argument, 3 /* String */)
                if (IsSymbol(key)) return key
                return ToString(key)
            }
            // 7.2 Testing and Comparison Operations
            // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
            // 7.2.2 IsArray(argument)
            // https://tc39.github.io/ecma262/#sec-isarray
            function IsArray(argument) {
                return Array.isArray
                    ? Array.isArray(argument)
                    : argument instanceof Object
                    ? argument instanceof Array
                    : Object.prototype.toString.call(argument) === '[object Array]'
            }
            // 7.2.3 IsCallable(argument)
            // https://tc39.github.io/ecma262/#sec-iscallable
            function IsCallable(argument) {
                // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
                return typeof argument === 'function'
            }
            // 7.2.4 IsConstructor(argument)
            // https://tc39.github.io/ecma262/#sec-isconstructor
            function IsConstructor(argument) {
                // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
                return typeof argument === 'function'
            }
            // 7.2.7 IsPropertyKey(argument)
            // https://tc39.github.io/ecma262/#sec-ispropertykey
            function IsPropertyKey(argument) {
                switch (Type(argument)) {
                    case 3 /* String */:
                        return true
                    case 4 /* Symbol */:
                        return true
                    default:
                        return false
                }
            }
            // 7.3 Operations on Objects
            // https://tc39.github.io/ecma262/#sec-operations-on-objects
            // 7.3.9 GetMethod(V, P)
            // https://tc39.github.io/ecma262/#sec-getmethod
            function GetMethod(V, P) {
                var func = V[P]
                if (func === undefined || func === null) return undefined
                if (!IsCallable(func)) throw new TypeError()
                return func
            }
            // 7.4 Operations on Iterator Objects
            // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
            function GetIterator(obj) {
                var method = GetMethod(obj, iteratorSymbol)
                if (!IsCallable(method)) throw new TypeError() // from Call
                var iterator = method.call(obj)
                if (!IsObject(iterator)) throw new TypeError()
                return iterator
            }
            // 7.4.4 IteratorValue(iterResult)
            // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
            function IteratorValue(iterResult) {
                return iterResult.value
            }
            // 7.4.5 IteratorStep(iterator)
            // https://tc39.github.io/ecma262/#sec-iteratorstep
            function IteratorStep(iterator) {
                var result = iterator.next()
                return result.done ? false : result
            }
            // 7.4.6 IteratorClose(iterator, completion)
            // https://tc39.github.io/ecma262/#sec-iteratorclose
            function IteratorClose(iterator) {
                var f = iterator['return']
                if (f) f.call(iterator)
            }
            // 9.1 Ordinary Object Internal Methods and Internal Slots
            // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
            // 9.1.1.1 OrdinaryGetPrototypeOf(O)
            // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
            function OrdinaryGetPrototypeOf(O) {
                var proto = Object.getPrototypeOf(O)
                if (typeof O !== 'function' || O === functionPrototype) return proto
                // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
                // Try to determine the superclass constructor. Compatible implementations
                // must either set __proto__ on a subclass constructor to the superclass constructor,
                // or ensure each class has a valid `constructor` property on its prototype that
                // points back to the constructor.
                // If this is not the same as Function.[[Prototype]], then this is definately inherited.
                // This is the case when in ES6 or when using __proto__ in a compatible browser.
                if (proto !== functionPrototype) return proto
                // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
                var prototype = O.prototype
                var prototypeProto = prototype && Object.getPrototypeOf(prototype)
                if (prototypeProto == null || prototypeProto === Object.prototype) return proto
                // If the constructor was not a function, then we cannot determine the heritage.
                var constructor = prototypeProto.constructor
                if (typeof constructor !== 'function') return proto
                // If we have some kind of self-reference, then we cannot determine the heritage.
                if (constructor === O) return proto
                // we have a pretty good guess at the heritage.
                return constructor
            }
            // naive Map shim
            function CreateMapPolyfill() {
                var cacheSentinel = {}
                var arraySentinel = []
                var MapIterator = /** @class */ (function () {
                    function MapIterator(keys, values, selector) {
                        this._index = 0
                        this._keys = keys
                        this._values = values
                        this._selector = selector
                    }
                    MapIterator.prototype['@@iterator'] = function () {
                        return this
                    }
                    MapIterator.prototype[iteratorSymbol] = function () {
                        return this
                    }
                    MapIterator.prototype.next = function () {
                        var index = this._index
                        if (index >= 0 && index < this._keys.length) {
                            var result = this._selector(this._keys[index], this._values[index])
                            if (index + 1 >= this._keys.length) {
                                this._index = -1
                                this._keys = arraySentinel
                                this._values = arraySentinel
                            } else {
                                this._index++
                            }
                            return { value: result, done: false }
                        }
                        return { value: undefined, done: true }
                    }
                    MapIterator.prototype.throw = function (error) {
                        if (this._index >= 0) {
                            this._index = -1
                            this._keys = arraySentinel
                            this._values = arraySentinel
                        }
                        throw error
                    }
                    MapIterator.prototype.return = function (value) {
                        if (this._index >= 0) {
                            this._index = -1
                            this._keys = arraySentinel
                            this._values = arraySentinel
                        }
                        return { value: value, done: true }
                    }
                    return MapIterator
                })()
                return /** @class */ (function () {
                    function Map() {
                        this._keys = []
                        this._values = []
                        this._cacheKey = cacheSentinel
                        this._cacheIndex = -2
                    }
                    Object.defineProperty(Map.prototype, 'size', {
                        get: function () {
                            return this._keys.length
                        },
                        enumerable: true,
                        configurable: true
                    })
                    Map.prototype.has = function (key) {
                        return this._find(key, /*insert*/ false) >= 0
                    }
                    Map.prototype.get = function (key) {
                        var index = this._find(key, /*insert*/ false)
                        return index >= 0 ? this._values[index] : undefined
                    }
                    Map.prototype.set = function (key, value) {
                        var index = this._find(key, /*insert*/ true)
                        this._values[index] = value
                        return this
                    }
                    Map.prototype.delete = function (key) {
                        var index = this._find(key, /*insert*/ false)
                        if (index >= 0) {
                            var size = this._keys.length
                            for (var i = index + 1; i < size; i++) {
                                this._keys[i - 1] = this._keys[i]
                                this._values[i - 1] = this._values[i]
                            }
                            this._keys.length--
                            this._values.length--
                            if (key === this._cacheKey) {
                                this._cacheKey = cacheSentinel
                                this._cacheIndex = -2
                            }
                            return true
                        }
                        return false
                    }
                    Map.prototype.clear = function () {
                        this._keys.length = 0
                        this._values.length = 0
                        this._cacheKey = cacheSentinel
                        this._cacheIndex = -2
                    }
                    Map.prototype.keys = function () {
                        return new MapIterator(this._keys, this._values, getKey)
                    }
                    Map.prototype.values = function () {
                        return new MapIterator(this._keys, this._values, getValue)
                    }
                    Map.prototype.entries = function () {
                        return new MapIterator(this._keys, this._values, getEntry)
                    }
                    Map.prototype['@@iterator'] = function () {
                        return this.entries()
                    }
                    Map.prototype[iteratorSymbol] = function () {
                        return this.entries()
                    }
                    Map.prototype._find = function (key, insert) {
                        if (this._cacheKey !== key) {
                            this._cacheIndex = this._keys.indexOf((this._cacheKey = key))
                        }
                        if (this._cacheIndex < 0 && insert) {
                            this._cacheIndex = this._keys.length
                            this._keys.push(key)
                            this._values.push(undefined)
                        }
                        return this._cacheIndex
                    }
                    return Map
                })()
                function getKey(key, _) {
                    return key
                }
                function getValue(_, value) {
                    return value
                }
                function getEntry(key, value) {
                    return [key, value]
                }
            }
            // naive Set shim
            function CreateSetPolyfill() {
                return /** @class */ (function () {
                    function Set() {
                        this._map = new _Map()
                    }
                    Object.defineProperty(Set.prototype, 'size', {
                        get: function () {
                            return this._map.size
                        },
                        enumerable: true,
                        configurable: true
                    })
                    Set.prototype.has = function (value) {
                        return this._map.has(value)
                    }
                    Set.prototype.add = function (value) {
                        return this._map.set(value, value), this
                    }
                    Set.prototype.delete = function (value) {
                        return this._map.delete(value)
                    }
                    Set.prototype.clear = function () {
                        this._map.clear()
                    }
                    Set.prototype.keys = function () {
                        return this._map.keys()
                    }
                    Set.prototype.values = function () {
                        return this._map.values()
                    }
                    Set.prototype.entries = function () {
                        return this._map.entries()
                    }
                    Set.prototype['@@iterator'] = function () {
                        return this.keys()
                    }
                    Set.prototype[iteratorSymbol] = function () {
                        return this.keys()
                    }
                    return Set
                })()
            }
            // naive WeakMap shim
            function CreateWeakMapPolyfill() {
                var UUID_SIZE = 16
                var keys = HashMap.create()
                var rootKey = CreateUniqueKey()
                return /** @class */ (function () {
                    function WeakMap() {
                        this._key = CreateUniqueKey()
                    }
                    WeakMap.prototype.has = function (target) {
                        var table = GetOrCreateWeakMapTable(target, /*create*/ false)
                        return table !== undefined ? HashMap.has(table, this._key) : false
                    }
                    WeakMap.prototype.get = function (target) {
                        var table = GetOrCreateWeakMapTable(target, /*create*/ false)
                        return table !== undefined ? HashMap.get(table, this._key) : undefined
                    }
                    WeakMap.prototype.set = function (target, value) {
                        var table = GetOrCreateWeakMapTable(target, /*create*/ true)
                        table[this._key] = value
                        return this
                    }
                    WeakMap.prototype.delete = function (target) {
                        var table = GetOrCreateWeakMapTable(target, /*create*/ false)
                        return table !== undefined ? delete table[this._key] : false
                    }
                    WeakMap.prototype.clear = function () {
                        // NOTE: not a real clear, just makes the previous data unreachable
                        this._key = CreateUniqueKey()
                    }
                    return WeakMap
                })()
                function CreateUniqueKey() {
                    var key
                    do key = '@@WeakMap@@' + CreateUUID()
                    while (HashMap.has(keys, key))
                    keys[key] = true
                    return key
                }
                function GetOrCreateWeakMapTable(target, create) {
                    if (!hasOwn.call(target, rootKey)) {
                        if (!create) return undefined
                        Object.defineProperty(target, rootKey, { value: HashMap.create() })
                    }
                    return target[rootKey]
                }
                function FillRandomBytes(buffer, size) {
                    for (var i = 0; i < size; ++i) buffer[i] = (Math.random() * 0xff) | 0
                    return buffer
                }
                function GenRandomBytes(size) {
                    if (typeof Uint8Array === 'function') {
                        if (typeof crypto !== 'undefined') return crypto.getRandomValues(new Uint8Array(size))
                        if (typeof msCrypto !== 'undefined') return msCrypto.getRandomValues(new Uint8Array(size))
                        return FillRandomBytes(new Uint8Array(size), size)
                    }
                    return FillRandomBytes(new Array(size), size)
                }
                function CreateUUID() {
                    var data = GenRandomBytes(UUID_SIZE)
                    // mark as random - RFC 4122 § 4.4
                    data[6] = (data[6] & 0x4f) | 0x40
                    data[8] = (data[8] & 0xbf) | 0x80
                    var result = ''
                    for (var offset = 0; offset < UUID_SIZE; ++offset) {
                        var byte = data[offset]
                        if (offset === 4 || offset === 6 || offset === 8) result += '-'
                        if (byte < 16) result += '0'
                        result += byte.toString(16).toLowerCase()
                    }
                    return result
                }
            }
            // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
            function MakeDictionary(obj) {
                obj.__ = undefined
                delete obj.__
                return obj
            }
        })
    })(Reflect$1 || (Reflect$1 = {}))

    var PointcutClass = (function () {
        function PointcutClass(rules, type) {
            if (type === void 0) {
                type = 'proto'
            }

            this.advices = {}
            this.rules = this.normalizedRules(rules)
            this.type = type
        }

        PointcutClass.prototype.registAdvice = function (type, advice) {
            this.advices[type] = advice
        }

        PointcutClass.prototype.findAdvice = function (type) {
            return this.advices[type]
        }

        PointcutClass.prototype.normalizedRules = function (rules) {
            var _this = this

            var _rules = rules

            if (!rules) {
                throw new Error('rules is requried')
            }

            if (typeof rules === 'string') {
                _rules = rules.split('&&').map(function (r) {
                    return r.trim()
                })
            }

            if (!Array.isArray(rules)) {
                _rules = [rules]
            }

            _rules = _rules.map(function (rule) {
                if (rule instanceof RegExp) {
                    return rule
                }

                if (typeof rule == 'string') {
                    return _this.toRegRule(rule)
                }

                if (!rule['className']) {
                    throw new Error('The property className of PointcutRuleType is required')
                }

                if (!rule['methodName']) {
                    throw new Error('The property methodName of PointcutRuleType is required')
                }

                'namespace,className,methodName'.split(',').forEach(function (k) {
                    if (typeof rule[k] === 'string') {
                        rule[k] = _this.toRegRule(rule[k])
                    }
                })
                return rule
            })
            return _rules
        }

        PointcutClass.prototype.toRegRule = function (rule) {
            var reg

            if (rule[0] === '?') {
                reg = new RegExp(
                    '^[_\\w]' + rule.substring(1).replace(/\?/gi, '[_\\w\\d]').replace(/\*/gi, '[_\\w\\d]*') + '$',
                    'g'
                )
            } else if (rule[0] === '*') {
                reg = new RegExp(
                    '^([_\\w]?|[_\\w][_\\w\\d]*)' +
                        rule.substring(1).replace(/\?/gi, '[_\\w\\d]').replace(/\*/gi, '[_\\w\\d]*') +
                        '$',
                    'g'
                )
            } else {
                reg = new RegExp('^' + rule.replace(/\?/gi, '[_\\w\\d]').replace(/\*/gi, '[_\\w\\d]*') + '$', 'g')
            }

            return reg
        }

        PointcutClass.prototype.eq = function (type, rules) {
            return type === this.type && rules === this.rules
        }

        PointcutClass.prototype.matches = function (ctx) {
            var _a = ctx.namespace,
                namespace = _a === void 0 ? '' : _a,
                _b = ctx.className,
                className = _b === void 0 ? '' : _b,
                _c = ctx.methodName,
                methodName = _c === void 0 ? '' : _c
            var ctxStr = '' + (namespace ? namespace + ':' : '') + className + '.' + methodName
            if (!className || !methodName) return false
            return this.rules.some(function (rule) {
                if (rule instanceof RegExp) return rule.test(ctxStr)
                rule = rule
                return (
                    (!rule.namespace || rule.namespace.test(namespace)) &&
                    (!rule.className || rule.className.test(className)) &&
                    (!rule.methodName || rule.methodName.test(methodName))
                )
            })
        }

        return PointcutClass
    })()
    var Pointcut = function (type) {
        if (type === void 0) {
            type = 'proto'
        }

        return function (target, propKey, descriptor) {
            var pointcutRules = target[propKey]
            var metaKey = 'MetaData:pointcuts'
            var pointcuts = Reflect.getMetadata(metaKey, target)

            if (!pointcuts) {
                pointcuts = new Map()
            }

            var pointCut = new PointcutClass(pointcutRules, type)
            pointcuts.set(propKey, pointCut)
            Reflect.defineMetadata(metaKey, pointcuts, target)
            return descriptor
        }
    }

    var createAdvice = function (type) {
        return function (options) {
            var pointcutName = options.value
            var metaKey = 'MetaData:pointcuts'
            return function (target, key, descriptor) {
                var fun = descriptor.value
                var pointcuts = Reflect.getMetadata(metaKey, target)
                var pt = pointcuts.get(pointcutName)
                pt.registAdvice(type, fun)
                pointcuts.set(pointcutName, pt)
                Reflect.defineMetadata(metaKey, pointcuts, target)
                return descriptor
            }
        }
    }

    var Before = createAdvice('before')
    var After = createAdvice('after')
    var Around = createAdvice('around')
    var AfterReturning = createAdvice('afterReturning')
    var AfterThrowing = createAdvice('afterThrowing')

    /*! *****************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function (d, b) {
        extendStatics =
            Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array &&
                function (d, b) {
                    d.__proto__ = b
                }) ||
            function (d, b) {
                for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]
            }
        return extendStatics(d, b)
    }

    function __extends(d, b) {
        if (typeof b !== 'function' && b !== null)
            throw new TypeError('Class extends value ' + String(b) + ' is not a constructor or null')
        extendStatics(d, b)
        function __() {
            this.constructor = d
        }
        d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
    }

    var JoinPoint = (function () {
        function JoinPoint(jp) {
            this.args = []
            var target = jp.target,
                args = jp.args,
                thisArg = jp.thisArg,
                value = jp.value
            this.target = target
            this.args = args
            this.thisArg = thisArg
            this.value = value
        }

        return JoinPoint
    })()

    var ProceedJoinPoint = (function (_super) {
        __extends(ProceedJoinPoint, _super)

        function ProceedJoinPoint(pjp) {
            var _this = this

            var target = pjp.target,
                args = pjp.args,
                thisArg = pjp.thisArg,
                value = pjp.value,
                proceed = pjp.proceed
            _this =
                _super.call(this, {
                    target: target,
                    args: args,
                    thisArg: thisArg,
                    value: value
                }) || this
            _this.proceed = proceed
            return _this
        }

        return ProceedJoinPoint
    })(JoinPoint)

    var isPromise = function (fn) {
        return !!fn && typeof fn.then === 'function' && fn[Symbol.toStringTag] === 'Promise'
    }

    var AOP = []
    var Aspect = function () {
        return function (target) {
            AOP.push(target)
        }
    }
    var Weaving = function (opts) {
        return function (target) {
            var _a = opts || {},
                _b = _a.namespace,
                namespace = _b === void 0 ? '' : _b
            _a.blackList

            var proto = target.prototype
            var props = Object.getOwnPropertyNames(target.prototype)
            var statics = Object.getOwnPropertyNames(target)
            var originTarget = target

            var weavePointcut = function (keys, ctx, type) {
                return keys.forEach(function (prop) {
                    var value = ctx[prop]

                    if (typeof value === 'function') {
                        var pointcuts_1 = Reflect.getMetadata('MetaData:pointcuts', target)

                        if (!pointcuts_1 || !pointcuts_1.length) {
                            pointcuts_1 = AOP.reduce(function (rst, aspect) {
                                var pts = Reflect.getMetadata('MetaData:pointcuts', aspect.prototype)

                                if (!pts) {
                                    return rst
                                }

                                return rst.concat(
                                    Array.from(pts.values()).filter(function (pointcut) {
                                        return (
                                            pointcut &&
                                            pointcut.type === type &&
                                            pointcut.matches({
                                                namespace: namespace,
                                                className: target.name,
                                                methodName: prop
                                            })
                                        )
                                    })
                                )
                            }, [])
                            Reflect.defineMetadata('Metadata:pointcuts', pointcuts_1, target)
                        }

                        if (!!pointcuts_1 && !!pointcuts_1.length) {
                            var value_1 = ctx[prop]
                            Object.defineProperty(ctx, prop, {
                                writable: true,
                                enumerable: true,
                                value: function () {
                                    var args = [].slice.call(arguments)
                                    var thisArg = this
                                    var joinpint = new JoinPoint({
                                        target: originTarget,
                                        thisArg: this,
                                        value: value_1,
                                        args: args
                                    })
                                    var index = -1
                                    var len = pointcuts_1.length

                                    var executeChain = function () {
                                        index++
                                        var pointcut = pointcuts_1[index]

                                        if (pointcut instanceof PointcutClass) {
                                            var before_1 = pointcut.findAdvice('before')
                                            var after_1 = pointcut.findAdvice('after')
                                            var around = pointcut.findAdvice('around')
                                            var afterThrowing_1 = pointcut.findAdvice('afterThrowing')
                                            var afterReturning_1 = pointcut.findAdvice('afterReturning')

                                            var proceed = function () {
                                                var rst = null
                                                var err = null

                                                if (before_1) {
                                                    before_1(joinpint)
                                                }

                                                try {
                                                    if (index < len - 1) {
                                                        rst = executeChain()
                                                    } else {
                                                        rst = Reflect.apply(value_1, thisArg, args)
                                                    }
                                                } catch (error) {
                                                    err = error
                                                }

                                                if (isPromise(rst)) {
                                                    return new Promise(function (resolve, reject) {
                                                        rst.then(
                                                            function (res) {
                                                                resolve(res)
                                                                afterReturning_1 && afterReturning_1(joinpint, res)
                                                                after_1 && after_1(joinpint, res, null)
                                                            },
                                                            function (error) {
                                                                err = error
                                                                reject(err)
                                                                afterThrowing_1 && afterThrowing_1(joinpint, err)
                                                                after_1 && after_1(joinpint, null, err)
                                                            }
                                                        )
                                                    })
                                                } else {
                                                    if (err) {
                                                        afterThrowing_1 && afterThrowing_1(joinpint, err)
                                                    } else {
                                                        afterReturning_1 && afterReturning_1(joinpint, rst)
                                                    }

                                                    after_1 && after_1(joinpint, rst, err)
                                                    return rst
                                                }
                                            }

                                            if (around) {
                                                var proceedJoinpint = new ProceedJoinPoint({
                                                    target: joinpint.target,
                                                    proceed: proceed,
                                                    value: joinpint.value,
                                                    args: joinpint.args,
                                                    thisArg: joinpint.thisArg
                                                })
                                                return around(proceedJoinpint)
                                            } else {
                                                return proceed()
                                            }
                                        }
                                    }

                                    return executeChain()
                                }
                            })
                        }
                    }
                })
            }

            weavePointcut(props, proto, 'proto')
            weavePointcut(statics, target, 'static')
            return target
        }
    }

    exports.After = After
    exports.AfterReturning = AfterReturning
    exports.AfterThrowing = AfterThrowing
    exports.Around = Around
    exports.Aspect = Aspect
    exports.Before = Before
    exports.Pointcut = Pointcut
    exports.Weaving = Weaving

    Object.defineProperty(exports, '__esModule', { value: true })

    return exports
})({})
