import { getPlaiceholder } from "plaiceholder";

export default async function getBaseUrl(imageUrl: string) {
  try {
    const src = imageUrl;

    const buffer = await fetch(src).then(async (res) =>
      Buffer.from(await res.arrayBuffer()),
    );

    const { base64 } = await getPlaiceholder(buffer);

    return base64;
  } catch (err) {
    err;
  }
}
