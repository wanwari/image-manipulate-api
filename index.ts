import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import { fileURLToPath } from "url";
import * as operate from "./Operations.js";
import { ModifyProps } from "./Interfaces.js";
import dotenv from "dotenv";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

app.use(cors());
app.use(fileUpload());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	session({
		secret: "IMA-" + process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: true,
	})
);
const PORT = process.env.PORT || 3000;

const sendImage = async (
	req: any,
	res: any,
	buffer: Buffer,
	properties: any
) => {
	const newFile = `./processed/${Date.now()}.${properties.fileFormat}`;
	const oldFile = `./uploaded/${req.session.fileName}`;
	sharp(buffer)
		.toFile(newFile)
		.then(async () => {
			res.sendFile(
				newFile,
				{
					root: __dirname,
				},
				() => {
					fs.unlinkSync(oldFile);
					fs.unlinkSync(newFile);
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
					req.session.fileName = uploadedImage.name;
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
		let buffer = fs.readFileSync(`uploaded/${req.session.fileName}`);
		editImage(req, res, buffer, properties);
	} catch (err) {
		console.log(err);
	}
});

const editImage = async (
	req: any,
	res: any,
	buffer: Buffer,
	properties: any
) => {
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

	await sendImage(req, res, buffer, properties);
};

app.listen(PORT, () => {
	console.log(`[SERVER] listening on port ${PORT}`);
});
