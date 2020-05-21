import { TestBed } from "@angular/core/testing";
import { Glue42Ng } from "../ng.module";
import { FactoryProvider, APP_INITIALIZER } from "@angular/core";
import { Glue42Initializer } from "../glue-initializer.service";
import { Glue42Store } from "../glue-store.service";
import { Glue42 } from "@glue42/desktop";
import { Glue42NgConfig } from "../types";

describe("Glue42Ng", () => {

    describe("forRoot unit", () => {

        let initializerSpy: jasmine.SpyObj<Glue42Initializer>;

        beforeEach(() => {
            initializerSpy = jasmine.createSpyObj<Glue42Initializer>("Glue42Initializer", ["start"]);
            initializerSpy.start.and.resolveTo();
        });

        it("should return an object with ngModule which is of class Glue42Ng and providers array", () => {
            const ngModule = Glue42Ng.forRoot();
            expect(ngModule.ngModule.name).toEqual("Glue42Ng");
        });

        it("should have a provider for APP_INITIALIZER", () => {
            const ngModule = Glue42Ng.forRoot();

            const providers = ngModule.providers;

            expect(providers.some((pr: FactoryProvider) => pr.provide && pr.provide === APP_INITIALIZER)).toBeTrue();
        });

        it("should have a provider for APP_INITIALIZER, multi true and Glue42Initializer, Glue42Store as deps", () => {
            const ngModule = Glue42Ng.forRoot();

            const providers = ngModule.providers;
            const appInitializerProvider = providers.find((pr: FactoryProvider) => pr.provide && pr.provide === APP_INITIALIZER) as FactoryProvider;

            const multi = appInitializerProvider.multi;
            const hasGlue42Initializer = appInitializerProvider.deps.some((dep) => dep.name === "Glue42Initializer");
            const hasGlue42Store = appInitializerProvider.deps.some((dep) => dep.name === "Glue42Store");

            expect(multi).toBeTrue();
            expect(hasGlue42Initializer).toBeTrue();
            expect(hasGlue42Store).toBeTrue();
        });

        it("should have a provider for Glue42Store", () => {
            const ngModule = Glue42Ng.forRoot();

            const providers = ngModule.providers;

            expect(providers.some((pr) => typeof pr === "function" && pr.name === "Glue42Store")).toBeTrue();
        });

        it("should have a provider for Glue42Initializer", () => {
            const ngModule = Glue42Ng.forRoot();

            const providers = ngModule.providers;

            expect(providers.some((pr) => typeof pr === "function" && pr.name === "Glue42Initializer")).toBeTrue();
        });

        it("the initializerFactory should call the initializer start once", async () => {

            const ngModule = Glue42Ng.forRoot();

            const appInitializer = ngModule.providers[0] as FactoryProvider;

            const useFactoryFunc = appInitializer.useFactory(initializerSpy);

            await useFactoryFunc();

            expect(initializerSpy.start).toHaveBeenCalledTimes(1);
        });

        it("the initializerFactory should call the initializer start with the settings config and settings factory", async () => {
            const mockSettings = {
                config: { test: 24 } as Glue42NgConfig,
                factory: async (): Promise<Glue42.Glue> => {
                    return { test: 42 } as unknown as Glue42.Glue;
                }
            };

            const ngModule = Glue42Ng.forRoot(mockSettings);

            const appInitializer = ngModule.providers[0] as FactoryProvider;

            const useFactoryFunc = appInitializer.useFactory(initializerSpy);

            await useFactoryFunc();

            expect(initializerSpy.start).toHaveBeenCalledWith(mockSettings.config, mockSettings.factory);
        });

        it("the initializerFactory should return promise by default", async () => {
            const ngModule = Glue42Ng.forRoot();

            const appInitializer = ngModule.providers[0] as FactoryProvider;

            const useFactoryFunc = appInitializer.useFactory(initializerSpy);

            const factoryResult = useFactoryFunc();

            expect(factoryResult).toBeInstanceOf(Promise);

            await factoryResult;
        });

        it("when settings.holdInit true the init factory should return a promise", async () => {
            const ngModule = Glue42Ng.forRoot({ holdInit: true });

            const appInitializer = ngModule.providers[0] as FactoryProvider;

            const useFactoryFunc = appInitializer.useFactory(initializerSpy);

            const factoryResult = useFactoryFunc();

            expect(factoryResult).toBeInstanceOf(Promise);

            await factoryResult;
        });

        it("when settings.holdInit false init factory should return void", () => {
            const ngModule = Glue42Ng.forRoot({ holdInit: false });

            const appInitializer = ngModule.providers[0] as FactoryProvider;

            const useFactoryFunc = appInitializer.useFactory(initializerSpy);

            const factoryResult = useFactoryFunc();

            expect(factoryResult).toBeUndefined();
        });

    });

    describe("forRoot integration ", () => {

        it("should not register Glue42Store when provided without forRoot", () => {
            TestBed.configureTestingModule({ imports: [Glue42Ng] });

            expect(() => TestBed.inject(Glue42Store)).toThrowError(/No provider/);
        });

        it("should not register Glue42Initializer when provided without forRoot", () => {
            TestBed.configureTestingModule({ imports: [Glue42Ng] });

            expect(() => TestBed.inject(Glue42Initializer)).toThrowError(/No provider/);
        });

        it("should register Glue42Store and Glue42Initializer when provided with forRoot", () => {
            TestBed.configureTestingModule({ imports: [Glue42Ng.forRoot()] });

            const initService = TestBed.inject(Glue42Initializer);
            const storeService = TestBed.inject(Glue42Store);

            expect(initService).toBeTruthy();
            expect(storeService).toBeTruthy();
        });
    });

});
