"use client";

import React from "react";

import CollectionEditor from "@/app/components/editors/CollectionEditor";

export default function EditCollectionPage({params}) {
    const { id } = React.use(params);
    return <CollectionEditor mode="edit" collectionId={id} />;
}
