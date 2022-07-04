const sharp = require("sharp");
import { ModifyProps } from "./Interfaces";

export const resize = async (image: Buffer, properties: ModifyProps) => {
	console.log(properties);

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

export const shapren = async (image: Buffer, properties: ModifyProps) => {
	return sharp(image).sharpen(properties).toBuffer();
};
