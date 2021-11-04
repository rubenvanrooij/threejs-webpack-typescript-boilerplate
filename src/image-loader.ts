import { Texture, TextureLoader } from "three";

const loader = new TextureLoader();

async function loadTexture(url: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
        loader.load(
            url,
            (texture) => resolve(texture),
            undefined,
            (error) => reject(error)
        );
    });
}

export async function getImageData(url: string): Promise<ImageData> {
    const { image } = await loadTexture(url);   
    const canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext( '2d' );

    if(!context) {
        throw new Error('No context');
    }

    context.drawImage( image, 0, 0 );

    return context.getImageData( 0, 0, image.width, image.height );
}