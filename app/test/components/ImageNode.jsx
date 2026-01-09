import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes } from "lexical";
import { $createImageNode } from "./ImageNode";

const ImageUploadButton = () => {
  const [editor] = useLexicalComposerContext();

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Convert image to Base64 or upload to a server and get a URL
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result;
      editor.update(() => {
        const imageNode = $createImageNode(imageUrl, file.name);
        $insertNodes([imageNode]);
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
    </div>
  );
};

export default ImageUploadButton;
