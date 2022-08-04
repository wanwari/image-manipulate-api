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
import child_process from "child_process";
import morgan from "morgan";

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
app.use(morgan("dev"));

const PORT = process.env.PORT || 3000;

const saveImages = async (
	folder: string,
	fileName: string,
	buffer: Buffer,
	fileFormat: string
) => {
	const newFile = `./processed/${folder}/${fileName}.${fileFormat}`;
	await sharp(buffer).toFile(newFile);
};

const sendImages = async (req: any, res: any) => {
	child_process.exec(
		`zip -r ./processed/${req.session.folder}/${req.session.folder}.zip ./processed/${req.session.folder}`,
		() => {
			res.sendFile(
				`./processed/${req.session.folder}/${req.session.folder}.zip`,
				{ root: __dirname },
				() => {
					fs.rm(
						`./processed/${req.session.folder}`,
						{ recursive: true },
						() => console.log("Deleted")
					);
					fs.rm(
						`./uploaded/${req.session.folder}`,
						{ recursive: true },
						() => console.log("Deleted")
					);
				}
			);
		}
	);
};

app.post("/upload", (req: any, res: any) => {
	try {
		if (!req.files) {
			res.send({
				uploaded: false,
				responseMessage: "Error. File was not uploaded",
			});
		} else {
			const now = Date.now();
			req.session.folder = now;
			fs.mkdirSync(`./uploaded/${now}`);
			fs.mkdirSync(`./processed/${now}`);

			const uploadedImages: any =
				req.files.image.length > 1
					? req.files.image
					: [req.files.image];
			for (let i = 0; i < uploadedImages.length; i++) {
				uploadedImages[i].mv(
					`./uploaded/${now}/${uploadedImages[i].name}`
				);
			}
			res.send({
				uploaded: true,
				responseMessage: "Success. Files were uploaded",
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).send({
			uploaded: false,
			responseMessage: "Error. File was not uploaded",
		});
	}
});

app.get("/edit", (req: any, res: any) => {
	const properties: ModifyProps = req.body;

	try {
		fs.readdir(`./uploaded/${req.session.folder}`, async (err, files) => {
			if (files) {
				for (let i = 0; i < files.length; i++) {
					const buffer = fs.readFileSync(
						`./uploaded/${req.session.folder}/${files[i]}`
					);
					const fileName = files[i].substring(
						0,
						files[i].indexOf(".")
					);

					await editImage(req, res, fileName, buffer, properties);
				}
				await sendImages(req, res);
			} else {
				res.status(500).send({
					edited: false,
					responseMessage: "Error. No files uploaded to edit.",
				});
			}
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			edited: false,
			responseMessage: "Error. Could not edit file(s).",
		});
	}
});

const editImage = async (
	req: any,
	res: any,
	fileName: string,
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

	await saveImages(
		req.session.folder,
		fileName,
		buffer,
		properties.fileFormat
	);
};

app.listen(PORT, () => {
	console.log(`[SERVER] listening on port ${PORT}`);
});
