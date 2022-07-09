import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import * as operate from "./Operations.js";
import { ModifyProps } from "./Interfaces.js";

const app = express();

app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

let fileName = "";
const sendImage = async (res: any, buffer: Buffer, properties: any) => {
	const file = `./processed/${Date.now()}.${properties.fileFormat}`;

	sharp(buffer)
		.toFile(file)
		.then(async () => {
			res.sendFile(
				file,
				{
					root: __dirname,
				},
				() => {
					fs.unlinkSync(`./uploaded/${fileName}`);
					fs.unlinkSync(file);
				}
			);
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

			uploadedImage
				.mv(`./uploaded/${uploadedImage.name}`)
				.then(async () => {
					let buffer = fs.readFileSync(
						`./uploaded/${uploadedImage.name}`
					);
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
	const properties: ModifyProps = req.body;
	try {
		let buffer = fs.readFileSync(`uploaded/${fileName}`);
		editImage(res, buffer, properties);
	} catch (err) {
		console.log(err);
	}
});

const editImage = async (res: any, buffer: Buffer, properties: any) => {
	if (properties.operations.includes("resize"))
		buffer = await operate.resize(buffer, properties);

	if (properties.operations.includes("flip"))
		buffer = await operate.flip(buffer);

	if (properties.operations.includes("flop"))
		buffer = await operate.flop(buffer);

	if (properties.operations.includes("rotate"))
		buffer = await operate.rotate(buffer, properties);

	if (properties.operations.includes("sharpen"))
		buffer = await operate.sharpen(buffer, properties);

	if (properties.operations.includes("blur"))
		buffer = await operate.blur(buffer, properties);

	if (properties.operations.includes("negate"))
		buffer = await operate.negate(buffer);

	if (properties.operations.includes("normalize"))
		buffer = await operate.normalize(buffer);

	if (properties.operations.includes("tint"))
		buffer = await operate.tint(buffer, properties);

	if (properties.operations.includes("grayscale"))
		buffer = await operate.grayscale(buffer);

	await sendImage(res, buffer, properties);
};

app.listen(PORT, () => {
	console.log(`[SERVER] listening on port ${PORT}`);
});
