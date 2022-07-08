import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { ModifyProps } from "./Interfaces";
import * as operate from "./Operations.js";

const app = express();

app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Don't need to declare __filename & __dirname when not using ES6 module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

let fileName = "";
const saveAndSendImage = async (res: any, buffer: Buffer, properties: any) => {
	const file = `processed/new.${properties.fileFormat}`;

	sharp(buffer)
		.toFile(file)
		.then(() => {
			res.sendFile(file, {
				root: __dirname,
			});
		});
};

app.post("/upload", (req: any, res: any) => {
	try {
		if (!req.files) {
			res.send({
				uploaded: false,
				responseMessage: "Error. File was not uploaded",
			});
		} else {
			const uploadedImage: any = req.files.image;

			uploadedImage.mv(`./img/${uploadedImage.name}`).then(async () => {
				let buffer = fs.readFileSync(`./img/${uploadedImage.name}`);
				fileName = uploadedImage.name;
				const metadata = await sharp(buffer).metadata();
				res.send(metadata);
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

app.get("/edit", (req: any, res: any) => {
	const properties: any = req.body;
	/*
	const properties: ModifyProps = {
		fileFormat: req.body.format,
		width: parseInt(req.body.width),
		height: parseInt(req.body.height),
		fit: req.body.fit,
		color: {
			r: parseInt(req.body.r),
			g: parseInt(req.body.g),
			b: parseInt(req.body.b),
			alpha: parseInt(req.body.alpha),
		},
		rotate: req.body.rotate,
		resize: req.body.resize,
		angle: parseInt(req.body.angle),
		sigma: parseInt(req.body.sigma),
		m1: parseInt(req.body.sigma),
		m2: parseInt(req.body.flat),
		x1: parseInt(req.body.flatAndJagged),
		y2: parseInt(req.body.brightening),
		y3: parseInt(req.body.darkening),
		blur: parseInt(req.body.blur),
		negate: req.body.negate,
		normalize: req.body.normalize,
		tint: {
			r: parseInt(req.body.tr),
			g: parseInt(req.body.tg),
			b: parseInt(req.body.tb),
			alpha: 0.2,
		},
	};

	try {
		let buffer = fs.readFileSync(`img/${fileName}`);
		editImage(res, buffer, properties);
		async () => {};
	} catch (err) {
		console.log(err);
	}
	*/
});

const editImage = async (res: any, buffer: Buffer, properties: any) => {
	buffer = await operate.sharpen(buffer, properties);

	await saveAndSendImage(res, buffer, properties);
};

app.listen(PORT, () => {
	console.log(`[SERVER] listening on port ${PORT}`);
});
