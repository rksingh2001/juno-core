import { useEffect } from 'react'
import EmailList from '../EmailList/EmailList'
import { setCurrentLabels } from '../../store/labelsSlice'
import { selectBaseLoaded } from '../../store/baseSlice'
import * as local from '../../constants/draftConstants'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import AnimatedMountUnmount from '../../utils/animatedMountUnmount'
import Seo from '../Elements/Seo'

const DraftEmail = () => {
  const baseLoaded = useAppSelector(selectBaseLoaded)
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (baseLoaded) {
      dispatch(setCurrentLabels(local.DRAFT_LABEL_ARRAY))
    }
  }, [baseLoaded])

  return (
    <>
      <Seo title={local.DRAFT_HEADER} />
      <AnimatedMountUnmount>
        <EmailList />
      </AnimatedMountUnmount>
    </>
  )
}

export default DraftEmail
