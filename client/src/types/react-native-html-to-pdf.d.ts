declare module "react-native-html-to-pdf" {
  export interface Options {
    html: string;
    fileName: string;
    directory?: string;
    base64?: boolean;
    height?: number;
    width?: number;
    padding?: number;
    fonts?: string[];
  }

  export interface PDFResult {
    filePath: string;
    base64?: string;
  }

  const RNHTMLtoPDF: {
    convert(options: Options): Promise<PDFResult>;
  };

  export default RNHTMLtoPDF;
}
