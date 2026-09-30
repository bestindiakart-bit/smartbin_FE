const IMG_URL = import.meta.env.VITE_BASE_IMAGE_URL || "";

const Image = ({ src = "", alt = "image", className = "", style = {} }) => {
  const isAbsolute =
    src?.startsWith("http") ||
    src?.startsWith("blob:") ||
    src?.startsWith("data:");

  const imageSrc = isAbsolute ? src : `${IMG_URL}${src}`;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        e.currentTarget.src =
          "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2558760599.jpg";
      }}
    />
  );
};

export default Image;
