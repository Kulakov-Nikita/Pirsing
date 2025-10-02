/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly BACKEND_SERVICE_URL: string
    // можно добавить и другие переменные
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  