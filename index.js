import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import sharp from "sharp";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000;

const resizeImage = async (imageBuffer, properties) => {
	let resized = sharp(imageBuffer)
		.resize({
			width: properties.width,
			height: properties.height,
			fit: "contain",
			background: {
				r: properties.colour.r,
				g: properties.colour.g,
				b: properties.colour.b,
				alpha: properties.colour.a,
			},
		})
		.extend({ background: "red" })
		.toFile(`./processed/new.${properties.format}`);
	return resized;
};

app.post("/upload", (req, res) => {
	try {
		if (!req.files) {
			res.send({
				uploaded: false,
				responseMessage: "Error. File was not uploaded",
			});
		} else {
			console.log(req.body.width);
			const uploadedImage = req.files.image;
			uploadedImage.mv("./img/" + uploadedImage.name).then(() => {
				const buffer = fs.readFileSync("./img/" + uploadedImage.name);

				const properties = {
					format: req.body.format,
					width: parseInt(req.body.width),
					height: parseInt(req.body.height),
					colour: {
						r: parseInt(req.body.r),
						g: parseInt(req.body.g),
						b: parseInt(req.body.b),
						a: parseInt(req.body.a),
					},
				};

				console.log(properties.colour);
				resizeImage(buffer, properties).then((response) => {
					console.log(response);

					fs.unlink("./img/" + uploadedImage.name, () => {
						res.status(202).sendFile(
							`/processed/new.${properties.format}`,
							{
								root: __dirname,
							}
						);
					});
				});
			});

			/*
            res.send({
				uploaded: true,
				responseMessage: "Success. File was uploaded",
			});
            */
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

app.listen(PORT, () => {
	console.log(`[SERVER] listening on port ${PORT}`);
});
