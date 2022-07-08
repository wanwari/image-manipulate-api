export interface Color {
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
	color?: Color;
	rotate?: string;
	resize?: string;
	angle?: number;
	sigma?: number;
	m1?: number;
	m2?: number;
	x1?: number;
	y2?: number;
	y3?: number;
	blur?: number;
	negate?: string;
	normalize?: string;
	tint: Color;
}
