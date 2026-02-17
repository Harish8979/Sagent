export default function ProductDetailPage({ product, goBack }: any) {
  return (
    <div style={{ padding: 20 }}>
      <button onClick={goBack}>⬅ Back</button>

      <img
        src={product.description}
        style={{ width: "100%", borderRadius: 20 }}
      />

      <h2>{product.name}</h2>

      <p>
        Fresh organic {product.name}. High quality and farm fresh.
      </p>

      <h3 style={{ color: "green" }}>₹{product.price}</h3>
    </div>
  );
}
