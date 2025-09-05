declare module "react-native-html-to-pdf" {
  export interface Options {
    html: string;
    fileName: string;
    directory?: string;
    base64?: boolean;
  }

  export interface PDF {
    filePath: string;
    base64?: string;
  }

  const RNHTMLtoPDF: {
    convert(options: Options): Promise<PDF>;
  };

  export = RNHTMLtoPDF; // 👈 important: use export= for CommonJS libs
}
