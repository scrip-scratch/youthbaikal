// src/components/QRCodeGenerator.js
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import { Button, Image } from "react-bootstrap";
import QqBg from "../assets/REG_EDIT.png";

export const QRCodeGenerator = (props: {
  userId: string;
  userName: string;
}) => {
  const downloadRef = useRef(null);

  const handleDownload = () => {
    const element = downloadRef.current;
    if (!element) return;
    html2canvas(element, { scale: 2 }).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "qr-code-image.png";
      link.click();
    });
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <div
        className="text-center position-relative"
        ref={downloadRef}
        style={{ width: 320 }}
      >
        <QRCodeCanvas
          value={`https://youth-baikal.store/participant/${props.userId}`}
          size={218}
          style={{ position: "absolute", top: 132, left: 53 }}
          fgColor="#ffffff"
          bgColor="transparent"
        />
        <Image src={QqBg} width="100%" />
        <h5
          className="custom-font text-center text-white"
          style={{
            width: 213,
            position: "absolute",
            bottom: props.userName.length > 16 ? 142 : 149,
            left: 53,
            fontSize: props.userName.length > 16 ? 15 : 16,
          }}
        >
          {props.userName}
        </h5>
      </div>
      <Button className="btn mt-4" onClick={handleDownload}>
        Скачать
      </Button>
    </div>
  );
};
