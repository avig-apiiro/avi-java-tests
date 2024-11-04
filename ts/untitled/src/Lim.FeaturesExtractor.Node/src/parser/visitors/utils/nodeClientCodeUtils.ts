const clientModules: Set<string> = new Set([
    "react",
    "redux",
    "react-dom",
    "jquery",
    "@angular/core",
    "@angular/common",
    "@angular/router",
    "vue",
    "vuex"
]);

export function isClientModule(importName: string): boolean {
    return clientModules.has(importName);
}
