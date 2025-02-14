import * as S from './TabsStyles'
import * as local from '../../../constants/menuConstants'
import { IEmailListThreadItem } from '../../../store/storeTypes/emailListTypes'
import checkAttachment from '../../../utils/checkAttachment'

const FilesTab = ({
  activeThread,
  activeLink,
  navigateTo,
}: {
  activeThread: IEmailListThreadItem
  activeLink: string
  navigateTo: ({ link, name }: { link: string; name: string }) => void
}) => {
  let filesCount = 0
  const uniqueFilesArray = [
    ...new Set(
      activeThread?.messages?.map((message) => checkAttachment(message))
    ),
  ]

  for (let i = 0; i < uniqueFilesArray.length; i += 1) {
    filesCount += uniqueFilesArray[i].length
  }

  return (
    <S.StyedListItem
      style={{ cursor: 'pointer' }}
      onClick={() => navigateTo(local.FILES_MENU_ITEM)}
      aria-hidden="true"
      isActive={activeLink === local.FILES_MENU_ITEM.name}
    >
      <S.StyledBadge badgeContent={filesCount} color="primary">
        {local.FILES_MENU_ITEM.name}
      </S.StyledBadge>
    </S.StyedListItem>
  )
}

export default FilesTab
