<?php

/**
 * Color Schema field class.
 *
 * @since 3.0
 */
class RWMB_Color_Schema_Field extends RWMB_Field {

	public static function init() {
		add_action( 'init', array( __CLASS__, 'reset' ) );
		add_action( 'learn-press/update-settings/updated', array( __CLASS__, 'update' ) );
	}

	public static function reset() {
		$nonce = LP_Request::get_string( 'reset-color' );

		if ( $nonce && wp_verify_nonce( $nonce, 'reset-color' ) ) {
			$schemas = get_option( 'learn_press_color_schemas' );

			if ( $schemas ) {
				foreach ( $schemas as $k => $schema ) {
					$colors = self::get_colors();

					foreach ( $colors as $m => $options ) {
						if ( array_key_exists( $options['id'], $schema ) ) {
							$schemas[ $k ][ $options['id'] ] = isset( $options['std'] ) ? $options['std'] : '';
						}
					}

					break;
				}
				update_option( 'learn_press_color_schemas', $schemas );
			}

			wp_redirect( remove_query_arg( 'reset-color' ) );
			exit();
		}
	}

	public static function update() {
		if ( ! empty( $_REQUEST['color_schema'] ) ) {
			update_option( 'learn_press_color_schemas', $_REQUEST['color_schema'] );
		}
	}

	protected static function get_colors() {
		return learn_press_get_color_schemas();
	}

	/**
	 * HTML
	 *
	 * @param mixed $meta
	 * @param array $field
	 *
	 * @return string
	 */
	public static function html( $meta, $field = array() ) {
		$settings = LP()->settings;
		ob_start();
		$colors = self::get_colors();

		$schemas = get_option( 'learn_press_color_schemas' );

		if ( ! $schemas ) {
			$schemas = array( $colors );
		} else {
			foreach ( $schemas as $k => $schema ) {
				$schemas[ $k ] = $colors;
				foreach ( $colors as $m => $options ) {
					if ( array_key_exists( $options['id'], $schema ) ) {
						$schemas[ $k ][ $m ]['std'] = $schema[ $options['id'] ];
					}
				}
			}
		}

		$schemas = array_values( $schemas );
		$hide    = ( $v = $settings->get( 'hide_admin_color_schemas' ) ) === 'yes' || ! $v;
		?>

		<div id="color-schemas" class="clearfix-after">
			<?php foreach ( $schemas as $k => $schema ) { ?>
				<div class="color-schemas<?php echo $k == 0 ? ' current' : ''; ?>">
					<ul>
						<?php
						foreach ( $schema as $option ) {
							$name = 'color_schema[' . $k . '][' . $option['id'] . ']';
							$std  = ! empty( $option['std'] ) ? $option['std'] : '';
							$id   = uniqid();
							?>
							<li>
								<label>
									<?php echo $option['title']; ?>
								</label>
								<div class="color-selector">
									<input name="<?php echo $name; ?>" id="<?php echo $id; ?>" value="<?php echo $std; ?>">
								</div>
								<a href="javascript:void(0)" onclick="jQuery('#<?php echo $id; ?>').val('<?php echo $option['value']; ?>').trigger('change');"><?php esc_html_e( 'Reset', 'learnpress' ); ?></a>
							</li>
						<?php } ?>
					</ul>
				</div>
			<?php } ?>
		</div>
		<a href="" id="learn-press-show-hide-schemas"><?php esc_html_e( 'Show/Hide', 'learnpress' ); ?></a>

		<script type="text/javascript">
			jQuery( function($) {
				var $btn = $('.color-schemas').on('click', '.clone-schema', function() {
					var $src = $(this).closest('.color-schemas'),
						$dst = $src.clone().find('.clone-schema').remove().end().insertAfter($src).removeClass('current'),
						$colorPickers = $dst.find('.wp-picker-container');
					$colorPickers.each( function() {
						var $colorPicker = $(this),
							$input = $colorPicker.find('.wp-color-picker');

						$input.insertAfter($colorPicker);
						$colorPicker.remove();
						$input.wpColorPicker();
					})

				});

				$('form').on('submit', function() {
					$('.color-schemas').each( function(i, el) {
						$(el).find('input').each( function() {
							var $input = $(this),
								name = $input.attr('name') || '';
							name = name.replace(new RegExp('color_schema\[[0-9]+\]'), 'color_schema[' + i + ']');
							$input.attr('name', name);
						})
					});
				});

				$(document).on('click', '.remove-schema', function(e) {
					e.preventDefault();
					$(this).closest('.color-schemas').remove();
				}).on('click', '.apply-schema', function(e) {
					e.preventDefault();
					var $current = $('.color-schemas.current:first'),
						$btn = $(this),
						$new = $btn.closest('.color-schemas');
					$current.insertAfter($new).removeClass('current');
					$current.parent().prepend($new.addClass('current'));
				}).on('click', '#learn-press-show-hide-schemas', function(e) {
					e.preventDefault();
					var hide = $('#color-schemas').toggleClass('hide-if-js').hasClass('hide-if-js');
					$.ajax({
						url: '../wp-json/lp/v1/settings/hide_admin_color_schemas',
						type: 'post',
						data: {
							data: hide ? 'yes' : 'no'
						}
					});
				});

				$('#color-schemas').find('.color-selector input').wpColorPicker();
			})
		</script>

		<?php
		return ob_get_clean();
	}
}

RWMB_Color_Schema_Field::init();
