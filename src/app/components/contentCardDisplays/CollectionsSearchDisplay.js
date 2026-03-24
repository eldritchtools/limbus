import Collection from "../contentCards/Collection";

export default function CollectionsSearchDisplay({ collections }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {collections.map(collection => <Collection key={collection.id} collection={collection} />)}
    </div>
}
