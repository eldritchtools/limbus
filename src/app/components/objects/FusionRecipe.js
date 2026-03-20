import Gift from "./Gift";

export default function FusionRecipe({ recipe, scale = 1, includeProduct = true }) {
    const fontStyle = { color: "#ECCDA3", fontSize: `${2.5 * scale}em` };
    const components = [];

    if (includeProduct) {
        components.push(<Gift key={components.length} id={recipe.id} scale={scale} />);
        components.push(<span key={components.length} style={fontStyle}>=</span>);
    }

    recipe.ingredients.forEach((ingredient, i) => {
        if (i !== 0) components.push(<span key={components.length} style={fontStyle}>+</span>);
        if (ingredient instanceof Object) {
            const half = Math.ceil(ingredient.options.length / 2);
            components.push(<div key={components.length} style={{ ...fontStyle, display: "flex", flexDirection: "row", alignItems: "center", gap: "5px" }}>
                {ingredient.count}x
                <div>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        {ingredient.options.slice(0, half).map((option, i) => <Gift key={i} id={option} scale={0.5 * scale} />)}
                    </div>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        {ingredient.options.slice(half).map((option, i) => <Gift key={i} id={option} scale={0.5 * scale} />)}
                    </div>
                </div>
            </div>)
        } else {
            components.push(<Gift key={components.length} id={ingredient} scale={scale} />);
        }
    });

    return <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>{components}</div>
}
