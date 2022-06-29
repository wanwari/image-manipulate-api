import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import sharp from "sharp";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { stringify } from "querystring";

const app = express();

app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000;

const resizeImage = async (imageBuffer, size) => {
	let resized = sharp(imageBuffer)
		.resize({
			width: size.width,
			height: size.height,
			fit: "contain",
			background: { r: 0, g: 255, b: 0, alpha: 1 },
		})
		.extend({ background: "red" })
		.toFile("./processed/new.webp");
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
			const uploadedImage = req.files.image;
			uploadedImage.mv("./img/" + uploadedImage.name).then(() => {
				const buffer = fs.readFileSync("./img/" + uploadedImage.name);

				resizeImage(buffer, {
					width: 100,
					height: 500,
				}).then((response) => {
					console.log(response);

					fs.unlink("./img/" + uploadedImage.name, () => {
						res.status(202).sendFile("/processed/new.webp", {
							root: __dirname,
						});
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
