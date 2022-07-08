export interface Colour {
	r: number;
	g: number;
	b: number;
	alpha?: number;
}

enum FitEnum {
	cover = "cover",
	contain = "contain",
	fill = "fill",
	inside = "inside",
	outside = "outside",
}

export interface ModifyProps {
	fileFormat: string;
	width?: number;
	height?: number;
	fit?: FitEnum;
	colour: Colour;
	angle?: number;
	sigma?: number;
	blur?: number;
	tint: Colour;
}
