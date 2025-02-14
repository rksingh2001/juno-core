import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navigation from '../MainHeader/Navigation/Navigation'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import Tabs from './Tabs/Tabs'
import DetailNavigationContainer from './DetailNavigation/DetailNavigationContainer'
import * as local from '../../constants/emailDetailConstants'
import * as global from '../../constants/globalConstants'
import BackButton from '../Elements/Buttons/BackButton'
import * as S from '../MainHeader/HeaderStyles'
import * as GS from '../../styles/globalStyles'
import { selectLabelIds, selectStorageLabels } from '../../store/labelsSlice'
import { findLabelById } from '../../utils/findLabel'
import EmailPosition from './EmailPosition/EmailPosition'
import {
  IEmailListObject,
  IEmailListObjectSearch,
} from '../../store/storeTypes/emailListTypes'
import { edgeLoadingNextPage } from '../../utils/loadNextPage'
import { selectCoreStatus, selectViewIndex } from '../../store/emailDetailSlice'
import {
  selectEmailListSize,
  selectIsSilentLoading,
} from '../../store/utilsSlice'

const EmailDetailHeader = ({
  activeEmailList,
}: {
  activeEmailList: IEmailListObject | IEmailListObjectSearch
}) => {
  const coreStatus = useAppSelector(selectCoreStatus)
  const storageLabels = useAppSelector(selectStorageLabels)
  const labelIds = useAppSelector(selectLabelIds)
  const viewIndex = useAppSelector(selectViewIndex)
  const isSilentLoading = useAppSelector(selectIsSilentLoading)
  const emailFetchSize = useAppSelector(selectEmailListSize)
  const dispatch = useAppDispatch()
  const location = useLocation()
  const [detailHeader, setDetailHeader] = useState<string>('')

  useEffect(() => {
    let mounted = true
    if (storageLabels.length > 0 && labelIds.length > 0) {
      if (location.pathname.includes(labelIds[0])) {
        const matchedLabel = findLabelById({ storageLabels, labelIds })
        if (matchedLabel.length > 0) {
          const splitHeader = matchedLabel[0].name.split('/')
          mounted &&
            setDetailHeader(splitHeader[splitHeader.length - 1].toLowerCase())
        } else {
          mounted && setDetailHeader(global.SEARCH_LABEL.toLowerCase())
        }
      }
    }
    return () => {
      mounted = false
    }
  }, [storageLabels, labelIds])

  // TODO: Double check amount of rerenders on this function
  // Attempt to load the next emails on the background when approaching the edge
  if (
    activeEmailList.threads.length - 1 - viewIndex <= 4 &&
    activeEmailList.nextPageToken
  ) {
    edgeLoadingNextPage({
      isSilentLoading,
      dispatch,
      labelIds,
      emailFetchSize,
      activeEmailList,
    })
  }

  return (
    <GS.OuterContainer data-testid="email-detail-header">
      {!coreStatus || coreStatus === global.CORE_STATUS_SEARCHING ? (
        <S.Wrapper>
          <S.HeaderCenter>
            <S.PageTitle>{detailHeader || local.INVALID_HEADER}</S.PageTitle>
          </S.HeaderCenter>
          <S.BackButtonWithNavgationContainer>
            <BackButton />
            <Navigation />
          </S.BackButtonWithNavgationContainer>
          <S.InnerMenu>
            {activeEmailList && (
              <>
                <Tabs activeEmailList={activeEmailList} />
                <DetailNavigationContainer activeEmailList={activeEmailList} />
              </>
            )}
          </S.InnerMenu>
        </S.Wrapper>
      ) : (
        <S.Wrapper>
          <S.FocusSortHeaderWrapper>
            {coreStatus === global.CORE_STATUS_FOCUSED ? (
              <S.PageTitle>{local.HEADER_FOCUS}</S.PageTitle>
            ) : (
              <S.PageTitle>{local.HEADER_SORT}</S.PageTitle>
            )}
          </S.FocusSortHeaderWrapper>
          <S.BackButtonWithNavgationContainer>
            <BackButton />
            <EmailPosition />
          </S.BackButtonWithNavgationContainer>
        </S.Wrapper>
      )}
    </GS.OuterContainer>
  )
}

export default EmailDetailHeader
