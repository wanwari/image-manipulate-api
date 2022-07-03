import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const resizeImage = async (imageBuffer, properties) => {
	let resized = sharp(imageBuffer)
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
		.extend({ background: "red" })
		.toBuffer()
		.then((data) => {
			return data;
		})
		.catch((err) => {
			console.log(err);
		});

	return resized;
};

const rotateImage = async (imageBuffer, properties) => {
	const rotated = sharp(imageBuffer)
		.flip()
		.toBuffer()
		.then((data) => {
			return data;
		})
		.catch((err) => {
			console.log(err);
		});

	return rotated;
};

const saveAndSendImage = async (res, buffer, fileName) => {
	sharp(buffer)
		.toFile(`processed/${fileName}`)
		.then(() => {
			res.sendFile("processed/new.jpeg", {
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
				};

				if (properties.resize === "true")
					buffer = await resizeImage(buffer, properties);

				if (properties.rotate === "true")
					buffer = await rotateImage(buffer, properties);

				await saveAndSendImage(
					res,
					buffer,
					`new.${properties.format}`
				).then(() => {
					console.log("Completed");
				});
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

app.listen(PORT, () => {
	console.log(`[SERVER] listening on port ${PORT}`);
});
