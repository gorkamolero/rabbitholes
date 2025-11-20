import { Controls, Background, BackgroundVariant, MiniMap } from '@xyflow/react';

export function FlowConfig() {
  return (
    <>
      <Controls className="!bg-[#111111] !border-gray-800" />
      <MiniMap
        style={{
          backgroundColor: '#111111',
          border: '1px solid #333333',
          borderRadius: '4px',
        }}
        nodeColor="#666666"
        maskColor="rgba(0, 0, 0, 0.7)"
        className="!bottom-4 !right-4"
      />
      <Background
        variant={BackgroundVariant.Dots}
        gap={12}
        size={1}
        color="rgba(255, 255, 255, 0.05)"
      />
    </>
  );
}
