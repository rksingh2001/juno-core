import { FiMoreHorizontal } from 'react-icons/fi'
import CustomButton from '../../Elements/Buttons/CustomButton'
import * as local from '../../../constants/emailDetailConstants'

interface IMoreOption {
  setShowMenu: (value: boolean) => void
  showMenu: boolean
}

const MoreOption = ({ setShowMenu, showMenu }: IMoreOption) => (
  <CustomButton
    icon={<FiMoreHorizontal />}
    onClick={() => setShowMenu(!showMenu)}
    label={local.BUTTON_MORE}
    suppressed
    title="Show more options"
  />
)

export default MoreOption
