// url-loader
declare module "*.svg" {
  const url: string
  export default url
}

declare module "*.png" {
  const url: string
  export default url
}

declare module "*.module.css" {
  const styles: Partial<Record<string, string>>
  export default styles
}
