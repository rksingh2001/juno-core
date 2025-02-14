import { useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import * as local from '../../../constants/emailDetailConstants'
import * as keyConstants from '../../../constants/keyConstants'
import { selectLabelIds, selectStorageLabels } from '../../../store/labelsSlice'
import filterIllegalLabels from '../../../utils/filterIllegalLabels'
import CustomButton from '../../Elements/Buttons/CustomButton'
import thrashMail from '../../EmailOptions/ThrashMail'
import { setModifierKey } from '../../../utils/setModifierKey'
import useMultiKeyPress from '../../../hooks/useMultiKeyPress'
import { selectInSearch } from '../../../store/utilsSlice'

interface IDeleteOption {
  threadId: string
  icon?: JSX.Element
  suppressed?: boolean
  noArchive?: boolean
}

const actionKeys = [setModifierKey, keyConstants.KEY_BACKSPACE]

const DeleteOption = ({
  threadId,
  icon = undefined,
  suppressed = false,
  noArchive = false,
}: IDeleteOption) => {
  const dispatch = useAppDispatch()
  const labelIds = useAppSelector(selectLabelIds)
  const storageLabels = useAppSelector(selectStorageLabels)
  const onlyLegalLabels = filterIllegalLabels(labelIds, storageLabels)
  const inSearch = useAppSelector(selectInSearch)
  const location = useLocation()

  const handleEvent = useCallback(() => {
    thrashMail({
      threadId,
      labelIds: onlyLegalLabels,
      dispatch,
      location,
    })
  }, [onlyLegalLabels, labelIds, dispatch])

  noArchive && useMultiKeyPress(handleEvent, actionKeys, inSearch)

  return (
    <CustomButton
      onClick={handleEvent}
      label={local.BUTTON_DELETE}
      icon={icon}
      suppressed={suppressed}
      title="Delete email"
    />
  )
}

export default DeleteOption
