import { Tooltip } from '@src-v2/components/tooltips/tooltip';

type PortType = {
  sourcePort: string;
  targetPort?: string;
  nodePort?: string;
  portName?: string;
  portProtocol?: string;
  name?: string;
  protocol?: string;
};

export const Port = ({
  port: { sourcePort, targetPort, nodePort, portName, portProtocol, name, protocol },
}: {
  port: PortType;
}) => {
  const combinedPortName = portName || name;
  const combinedPortProtocol = portProtocol || protocol;
  return (
    <Tooltip
      content={
        <div>
          {combinedPortName && combinedPortName} {sourcePort} {targetPort && `-> ${targetPort}`}{' '}
          {nodePort && `; node port = ${nodePort}`}{' '}
          {combinedPortProtocol && `(${combinedPortProtocol})`}
        </div>
      }>
      <>{sourcePort}</>
    </Tooltip>
  );
};
