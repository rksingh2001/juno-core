import { useCallback } from 'react'
import { FiDelete } from 'react-icons/fi'
import * as local from '../../constants/composeEmailConstants'
import { selectDraft } from '../../store/draftsSlice'
import {
  selectIsReplying,
  selectIsForwarding,
  setIsReplying,
  setIsForwarding,
} from '../../store/emailDetailSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { navigateBack } from '../../store/utilsSlice'
import CustomButton from '../Elements/Buttons/CustomButton'
import discardDraft from '../EmailOptions/DiscardDraft'

const DiscardDraftButton = ({
  draftId,
  messageOverviewListener = undefined,
}: {
  draftId: string
  messageOverviewListener?: (value: string) => void
}) => {
  const dispatch = useAppDispatch()
  const draftList = useAppSelector(selectDraft)
  const isReplying = useAppSelector(selectIsReplying)
  const isForwarding = useAppSelector(selectIsForwarding)

  const draftMessage = useCallback(
    () => draftList.find((draft) => draft.id === draftId)?.message,
    [draftId]
  )

  const handleClick = useCallback(() => {
    const foundDraft = draftMessage()
    if (foundDraft) {
      const { id, threadId } = foundDraft
      discardDraft({
        messageId: isReplying || isForwarding ? id : undefined,
        threadId,
        dispatch,
        draftId,
      })
      if (messageOverviewListener) {
        messageOverviewListener(id)
      }
      if (isReplying) {
        dispatch(setIsReplying(false))
        return
      }
      if (isForwarding) {
        dispatch(setIsForwarding(false))
        return
      }
      dispatch(navigateBack())
    }
  }, [draftId, isForwarding, isReplying])

  return draftMessage() ? (
    <CustomButton
      label={local.DISCARD_DRAFT_BUTTON}
      icon={<FiDelete />}
      suppressed
      onClick={handleClick}
      title="Delete"
    />
  ) : null
}

export default DiscardDraftButton
