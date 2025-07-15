// Fix for Vite string imports
declare module "*?raw"
{
    const content: string
    export default content
}