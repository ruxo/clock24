declare module "gulp-connect" {
  interface ServerOptions {
    root?: string|string[];
    livereload?: boolean|{port:number};
    port?: number;
    host?: string;
    https?: boolean;
    fallback?: string;
    middleware?: Function[];
  }

  /** Run server with default configuration */
  function server() :void;
  function server(options: ServerOptions) :void;

  function serverClose() :void;

  function reload() :void;
}
