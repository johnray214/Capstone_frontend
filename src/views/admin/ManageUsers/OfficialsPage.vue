<template>
<SidebarLayout page-title="POSU Officers Management">
<OfficialsManagement :currentUserRole="authState.user?.role">

</OfficialsManagement>
</SidebarLayout>
</template>
<script>
import SidebarLayout from '@/components/SidebarLayout.vue';
import OfficialsManagement from '@/components/OfficialsManagement.vue';
import { useAuthStore } from '@/stores/auth';
export default {
	name: 'OfficialsPage',
	components: {
		SidebarLayout,
		OfficialsManagement,
	},
	setup() {
		const authStore = useAuthStore()

		authStore.initAuth()

		return {
			authState: authStore.state
		}
	}
}
</script>