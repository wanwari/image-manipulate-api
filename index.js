import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath, urlToHttpOptions } from "url";

const app = express();

app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

let fileName = "";

const resizeImage = async (imageBuffer, properties) => {
	return sharp(imageBuffer)
		.resize({
			width: properties.width,
			height: properties.height,
			fit: properties.fit,
			background: {
				r: properties.colour.r,
				g: properties.colour.g,
				b: properties.colour.b,
				alpha: properties.colour.a,
			},
		})
		.toBuffer();
};

const rotateImage = async (imageBuffer, properties) => {
	return sharp(imageBuffer)
		.rotate(properties.angle, {
			background: {
				r: properties.colour.r,
				g: properties.colour.g,
				b: properties.colour.b,
				alpha: properties.colour.a,
			},
		})
		.toBuffer();
};

const flipImage = async (imageBuffer) => {
	return sharp(imageBuffer).flip().toBuffer();
};

const flopImage = async (imageBuffer) => {
	return sharp(imageBuffer).flop().toBuffer();
};

const sharpenImage = async (imageBuffer, properties) => {
	return sharp(imageBuffer)
		.sharpen({
			sigma: properties.sigma,
			m1: properties.flat,
			m2: properties.jagged,
			x1: properties.flatAndJaggedThreshold,
			y1: properties.brightening,
			y2: properties.darkening,
		})
		.toBuffer();
};

const medianImage = async (imageBuffer, properties) => {
	return sharp(imageBuffer).median(properties.median).toBuffer();
};

const saveAndSendImage = async (res, buffer, properties) => {
	const file = `processed/new.${properties.format}`;

	sharp(buffer)
		.toFile(file)
		.then(() => {
			res.sendFile(file, {
				root: __dirname,
			});
		});
};

app.post("/upload", (req, res) => {
	try {
		if (!req.files) {
			res.send({
				uploaded: false,
				responseMessage: "Error. File was not uploaded",
			});
		} else {
			const uploadedImage = req.files.image;

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

app.get("/edit", (req, res) => {
	const properties = {
		format: req.body.format,
		width: parseInt(req.body.width),
		height: parseInt(req.body.height),
		fit: req.body.fit,
		colour: {
			r: parseInt(req.body.r),
			g: parseInt(req.body.g),
			b: parseInt(req.body.b),
			a: parseInt(req.body.a),
		},
		rotate: req.body.rotate,
		resize: req.body.resize,
		angle: parseInt(req.body.angle),
		sigma: parseInt(req.body.sigma),
	};

	try {
		let buffer = fs.readFileSync(`img/${fileName}`);
		editImage(res, buffer, properties);
		async () => {};
	} catch (err) {
		console.log(err);
	}
});

const editImage = async (res, buffer, properties) => {
	if (properties.resize === "true")
		buffer = await resizeImage(buffer, properties);

	if (properties.rotate === "true")
		buffer = await rotateImage(buffer, properties);

	buffer = await medianImage(buffer, properties);

	await saveAndSendImage(res, buffer, properties);
};

app.listen(PORT, () => {
	console.log(`[SERVER] listening on port ${PORT}`);
});
