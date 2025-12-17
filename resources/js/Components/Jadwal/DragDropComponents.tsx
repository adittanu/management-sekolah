import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableProps {
    id: string;
    children: React.ReactNode;
    data?: any;
}

export function DraggableScheduleCard({ id, children, data }: DraggableProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: data
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none', // Critical for touch devices
        zIndex: isDragging ? 50 : 'auto',
        position: isDragging ? 'relative' : 'static' as any,
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="h-full">
            {children}
        </div>
    );
}

interface DroppableProps {
    id: string;
    children: React.ReactNode;
    isOverColor?: string;
}

export function DroppableCell({ id, children }: DroppableProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    const style = {
        backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className={`h-full transition-colors ${isOver ? 'ring-2 ring-inset ring-blue-400' : ''}`}>
            {children}
        </div>
    );
}
