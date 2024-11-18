import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

type UnsupportedType =
  | 'VECTOR'
  | 'GROUP'
  | 'STAR'
  | 'ELLIPSE'
  | 'LINE'
  | 'REGULAR_POLYGON'
  | 'SLICE'
  | 'IMAGE'
  | 'INSTANCE'
  | 'COMPONENT';

export type UnsupportedElementProps = {
  type: UnsupportedType;
  elementClassName: string;
};
export function UnsupportedElement(props: UnsupportedElementProps) {
  const { type, elementClassName } = props;
  return (
    <div
      className={`${elementClassName} relative group border border-red-500 border-dashed`}
      data-tooltip-id='tooltip'
      data-tooltip-content={`Unsupported: ${type}`}
    >
      <Tooltip
        id='tooltip'
        place='top'
        className='bg-black text-white p-2 rounded-[4px] text-xs whitespace-nowrap'
      />
    </div>
  );
}