import sharp from "sharp";
import { ModifyProps } from "./Interfaces";

export const resize = async (image: Buffer, properties: ModifyProps) => {
	return sharp(image)
		.resize(properties.width, properties.height, {
			fit: properties.fit,
			background: properties.color,
		})
		.toBuffer();
};

export const flip = async (image: Buffer) => {
	return sharp(image).flip().toBuffer();
};

export const flop = async (image: Buffer) => {
	return sharp(image).flop().toBuffer();
};

export const rotate = async (image: Buffer, properties: ModifyProps) => {
	return sharp(image)
		.rotate(properties.angle, {
			background: properties.color,
		})
		.toBuffer();
};

export const sharpen = async (image: Buffer, properties: ModifyProps) => {
	return sharp(image).sharpen(properties.sigma).toBuffer();
};

export const blur = async (image: Buffer, properties: ModifyProps) => {
	return sharp(image).blur(properties.blur).toBuffer();
};

export const negate = async (image: Buffer) => {
	return sharp(image).negate().toBuffer();
};

export const normalize = async (image: Buffer) => {
	return sharp(image).normalize().toBuffer();
};

export const tint = async (image: Buffer, properties: ModifyProps) => {
	return sharp(image).tint(properties.tint).toBuffer();
};

export const grayscale = async (image: Buffer) => {
	return sharp(image).grayscale().toBuffer();
};
