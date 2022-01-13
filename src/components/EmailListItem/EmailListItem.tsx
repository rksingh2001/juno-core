import React, { memo } from 'react'
import EmailAvatar from '../Elements/Avatar/EmailAvatar'
import EmailHasAttachment from '../Elements/EmailHasAttachment'
import TimeStampDisplay from '../Elements/TimeStamp/TimeStampDisplay'
import MessageCount from '../Elements/MessageCount'
import Snippet from './Snippet'
import InlineThreadActionsRegular from './InlineThreadActionsRegular'
import * as S from './EmailListItemStyles'
import * as draft from '../../constants/draftConstants'
import * as global from '../../constants/globalConstants'
import openEmail from '../../utils/openEmail'
import { useAppDispatch, useAppSelector } from '../../Store/hooks'
import { IEmailListThreadItem } from '../../Store/emailListTypes'
import GetTimeStamp from '../Elements/TimeStamp/GetTimeStamp'
import RecipientName from '../Elements/RecipientName'
import SenderNamePartial from '../Elements/SenderName/senderNamePartial'
import SenderNameFull from '../Elements/SenderName/senderNameFull'
import EmailSubject from '../Elements/EmailSubject'
import EmailSnippet from '../Elements/EmailSnippet'
import InlineThreadActionsDraft from './InlineThreadActionsDraft'
import { selectProfile } from '../../Store/baseSlice'
import EmailLabel from '../Elements/EmailLabel'
import { selectIsSearching } from '../../Store/utilsSlice'
import { selectStorageLabels } from '../../Store/labelsSlice'

const EmailListItem = memo(({ email, showLabel }: { email: IEmailListThreadItem, showLabel: boolean }) => {
  const { emailAddress } = useAppSelector(selectProfile)
  const isSearching = useAppSelector(selectIsSearching)
  const storageLabels = useAppSelector(selectStorageLabels)
  const { id } = email
  const dispatch = useAppDispatch()

  // Setting an email label is required for the path.
  const emailLabels = () => {
    if (email && email.messages) return email.messages[email.messages.length - 1].labelIds ?? [global.ARCHIVE_LABEL]
    if (email && email.message) return email.message.labelIds ?? [global.ARCHIVE_LABEL]
    return [global.ARCHIVE_LABEL]
  }

  const staticEmailLabels = emailLabels()
  const staticRecipientName = RecipientName(email.message || email.messages![email.messages!.length - 1])
  const staticSenderPartial = SenderNamePartial(email.message || email.messages![email.messages!.length - 1], emailAddress)
  const staticSenderFull = SenderNameFull(email.message || email.messages![email.messages!.length - 1], emailAddress)
  const staticSubjectFetch = EmailSubject(email.message || email.messages![email.messages!.length - 1])
  const staticSubject = staticSubjectFetch.length > 0 ? staticSubjectFetch : global.NO_SUBJECT
  const staticSnippet = EmailSnippet(email.message || email.messages![email.messages!.length - 1])

  const handleClick = () => {
    openEmail({ labelIds: staticEmailLabels, id, email, dispatch, isSearching, storageLabels })
  }

  return (
    <S.ThreadBase emailLabels={staticEmailLabels}>
      <S.ThreadRow showLabel={showLabel}>
        <div />
        <S.CellCheckbox>{
          staticEmailLabels.includes(global.UNREAD_LABEL) && <S.UnreadDot />
        }</S.CellCheckbox>
        <S.CellName
          onClick={handleClick}
          aria-hidden="true"
        >
          <S.Avatars>
            {!staticEmailLabels.includes(draft.DRAFT_LABEL) ? (
              <EmailAvatar avatarURL={staticSenderFull} />
            ) : (
              <EmailAvatar avatarURL={staticRecipientName.name} />
            )}
          </S.Avatars>
          {!staticEmailLabels.includes(draft.DRAFT_LABEL) ? (
            <span className="text_truncate" title={staticSenderPartial.emailAddress}>{staticSenderPartial.name ?? staticSenderPartial.emailAddress}</span>
          ) : (
            <span className="text_truncate" title={staticRecipientName.emailAddress}>{staticRecipientName.name}</span>
          )}
          {email.messages && <MessageCount countOfMessage={email.messages} />}
        </S.CellName>
        {showLabel && <S.CellLabels><EmailLabel labelNames={staticEmailLabels} /></S.CellLabels>}
        <S.CellMessage
          onClick={handleClick}
          aria-hidden="true"
        >
          <div className="subjectSnippet text_truncate">
            {staticEmailLabels.includes(draft.DRAFT_LABEL) && (
              <span style={{ fontWeight: 'bold' }}>{draft.DRAFT_SNIPPET_INDICATOR}</span>
            )}
            <span>{staticSubject}</span>
            <Snippet snippet={staticSnippet} />
          </div>
        </S.CellMessage>

        <S.CellAttachment>
          {email.messages && <EmailHasAttachment messages={email.messages} />}
        </S.CellAttachment>
        <S.CellDate>
          <S.DatePosition>
            <span className="date">
              <TimeStampDisplay threadTimeStamp={GetTimeStamp(email)} />
            </span>
          </S.DatePosition>
        </S.CellDate>
        <div />
        <div />
        {!staticEmailLabels.includes(draft.DRAFT_LABEL) ? (
          <InlineThreadActionsRegular id={id} labelIds={staticEmailLabels} />
        ) : (
          <InlineThreadActionsDraft threadId={id} />
        )}
      </S.ThreadRow>
    </S.ThreadBase>
  )
})

export default EmailListItem
