"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteContent } from "@/actions/content";

export function DeleteButton({ contentId }: { contentId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que quieres borrar esta pieza? Esta acción no se puede deshacer.")) return;
    
    setIsDeleting(true);
    await deleteContent(contentId);
    // El revalidatePath en el action actualizará la lista automáticamente
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      title="Borrar pieza"
      className="px-2 border-slate-700 bg-slate-900/50 hover:bg-red-900/50 hover:text-red-400 hover:border-red-900/50 text-slate-500"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
