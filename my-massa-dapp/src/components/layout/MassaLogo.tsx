import React from "react";
import massaLogo from "../../assets/massa-logo.png";

interface MassaLogoProps {
  size?: number;
  className?: string;
}

const MassaLogo: React.FC<MassaLogoProps> = ({ size = 40, className = "" }) => (
  <img
    src={massaLogo}
    alt="Massa Logo"
    width={size}
    height={size}
    className={className}
    style={{ display: "inline-block", width: size, height: size }}
  />
);

export default MassaLogo; 